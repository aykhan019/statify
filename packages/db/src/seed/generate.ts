import { ALBUM_WORDS, ARTIST_ADJECTIVES, ARTIST_NOUNS, PLAYLIST_THEMES, TRACK_WORDS } from './data';
import { createRng, type Rng } from './rng';

export interface SeedArtist {
  spotifyUri: string;
  name: string;
  normalizedName: string;
}

export interface SeedAlbum {
  spotifyUri: string;
  name: string;
  primaryArtistSpotifyUri: string;
}

export interface SeedTrack {
  spotifyUri: string;
  name: string;
  albumSpotifyUri: string;
  primaryArtistSpotifyUri: string;
  durationMs: number;
}

export interface SeedMpdPlaylist {
  mpdPid: number;
  name: string;
  collaborative: boolean;
  modifiedAt: Date;
  numFollowers: number;
  numEdits: number;
  durationMs: bigint;
}

export interface SeedPlaylistTrack {
  mpdPid: number;
  trackSpotifyUri: string;
  pos: number;
}

export interface SeedListeningHistoryEntry {
  userIndex: number;
  trackSpotifyUri: string;
  playedAt: Date;
  durationPlayedMs: number;
  source: 'preview' | 'seed';
}

export interface SeedCorpus {
  artists: SeedArtist[];
  albums: SeedAlbum[];
  tracks: SeedTrack[];
  playlists: SeedMpdPlaylist[];
  playlistTracks: SeedPlaylistTrack[];
  history: SeedListeningHistoryEntry[];
}

export interface SeedCounts {
  users: number;
  artists: number;
  albums: number;
  tracks: number;
  playlists: number;
  historyUsers: number;
  historyPerUser: { min: number; max: number };
  historyDays: number;
}

export const DEFAULT_SEED_COUNTS: SeedCounts = {
  users: 5,
  artists: 80,
  albums: 200,
  tracks: 600,
  playlists: 60,
  historyUsers: 3,
  historyPerUser: { min: 60, max: 110 },
  historyDays: 21,
};

export const SEED_PRNG_SEED = 0x5_7a_71_f1;
export const SEED_REFERENCE_DATE = new Date('2026-05-23T12:00:00.000Z');

const HISTORY_HOUR_WEIGHTS = buildHourWeights();

export function generateCorpus(
  counts: SeedCounts = DEFAULT_SEED_COUNTS,
  referenceDate: Date = SEED_REFERENCE_DATE,
): SeedCorpus {
  const rng = createRng(SEED_PRNG_SEED);
  const artists = generateArtists(rng, counts.artists);
  const albums = generateAlbums(rng, counts.albums, artists);
  const tracks = generateTracks(rng, counts.tracks, albums);
  const playlists = generatePlaylists(rng, counts.playlists, referenceDate);
  const playlistTracks = generatePlaylistTracks(rng, playlists, tracks);
  const history = generateHistory(rng, counts, tracks, referenceDate);

  return { artists, albums, tracks, playlists, playlistTracks, history };
}

function generateArtists(rng: Rng, count: number): SeedArtist[] {
  const seen = new Set<string>();
  const artists: SeedArtist[] = [];
  let n = 0;

  while (artists.length < count) {
    const name = `${rng.pick(ARTIST_ADJECTIVES)} ${rng.pick(ARTIST_NOUNS)}`;
    if (seen.has(name)) {
      n += 1;
      if (n > count * 4) {
        break;
      }
      continue;
    }
    seen.add(name);
    artists.push({
      spotifyUri: `spotify:artist:seed-${artists.length + 1}`,
      name,
      normalizedName: normalize(name),
    });
  }

  return artists;
}

function generateAlbums(rng: Rng, count: number, artists: SeedArtist[]): SeedAlbum[] {
  const albums: SeedAlbum[] = [];
  for (let i = 0; i < count; i += 1) {
    const primary = rng.pick(artists);
    const word = rng.pick(ALBUM_WORDS);
    const suffix = rng.int(1, 3) === 1 ? ` ${rng.pick(ALBUM_WORDS)}` : '';
    albums.push({
      spotifyUri: `spotify:album:seed-${i + 1}`,
      name: `${word}${suffix}`,
      primaryArtistSpotifyUri: primary.spotifyUri,
    });
  }
  return albums;
}

function generateTracks(rng: Rng, count: number, albums: SeedAlbum[]): SeedTrack[] {
  const tracks: SeedTrack[] = [];
  for (let i = 0; i < count; i += 1) {
    const album = rng.pick(albums);
    const word = rng.pick(TRACK_WORDS);
    tracks.push({
      spotifyUri: `spotify:track:seed-${i + 1}`,
      name: word,
      albumSpotifyUri: album.spotifyUri,
      primaryArtistSpotifyUri: album.primaryArtistSpotifyUri,
      durationMs: rng.int(140_000, 320_000),
    });
  }
  return tracks;
}

function generatePlaylists(rng: Rng, count: number, reference: Date): SeedMpdPlaylist[] {
  const playlists: SeedMpdPlaylist[] = [];
  for (let i = 0; i < count; i += 1) {
    const daysAgo = rng.int(0, 90);
    const modifiedAt = new Date(reference.getTime() - daysAgo * 86_400_000);
    const theme = rng.pick(PLAYLIST_THEMES);
    playlists.push({
      mpdPid: 1_000_000 + i,
      name: theme,
      collaborative: rng.bool(0.1),
      modifiedAt,
      numFollowers: rng.int(0, 250),
      numEdits: rng.int(1, 12),
      durationMs: BigInt(rng.int(900_000, 4_200_000)),
    });
  }
  return playlists;
}

function generatePlaylistTracks(
  rng: Rng,
  playlists: SeedMpdPlaylist[],
  tracks: SeedTrack[],
): SeedPlaylistTrack[] {
  const entries: SeedPlaylistTrack[] = [];

  for (const playlist of playlists) {
    const size = rng.int(12, 28);
    const used = new Set<string>();
    let pos = 0;
    while (used.size < size && used.size < tracks.length) {
      const track = rng.pick(tracks);
      if (used.has(track.spotifyUri)) {
        continue;
      }
      used.add(track.spotifyUri);
      entries.push({
        mpdPid: playlist.mpdPid,
        trackSpotifyUri: track.spotifyUri,
        pos,
      });
      pos += 1;
    }
  }

  return entries;
}

function generateHistory(
  rng: Rng,
  counts: SeedCounts,
  tracks: SeedTrack[],
  reference: Date,
): SeedListeningHistoryEntry[] {
  const entries: SeedListeningHistoryEntry[] = [];
  const referenceMidnight = new Date(reference);
  referenceMidnight.setUTCHours(0, 0, 0, 0);

  for (let userIndex = 1; userIndex <= counts.historyUsers; userIndex += 1) {
    const total = rng.int(counts.historyPerUser.min, counts.historyPerUser.max);
    for (let i = 0; i < total; i += 1) {
      const track = rng.pick(tracks);
      const daysAgo = rng.int(0, counts.historyDays - 1);
      const hour = pickWeighted(rng, HISTORY_HOUR_WEIGHTS);
      const minute = rng.int(0, 59);
      const second = rng.int(0, 59);
      const playedAt = new Date(referenceMidnight.getTime() - daysAgo * 86_400_000);
      playedAt.setUTCHours(hour, minute, second, 0);
      if (playedAt.getTime() > reference.getTime()) {
        playedAt.setTime(reference.getTime());
      }

      entries.push({
        userIndex,
        trackSpotifyUri: track.spotifyUri,
        playedAt,
        durationPlayedMs: Math.min(track.durationMs, rng.int(15_000, 30_000)),
        source: 'preview',
      });
    }
  }

  entries.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
  return entries;
}

function buildHourWeights(): number[] {
  const weights = new Array<number>(24).fill(0.5);
  for (const h of [7, 8, 9]) {
    weights[h] = 2.0;
  }
  for (const h of [12, 13]) {
    weights[h] = 1.5;
  }
  for (const h of [17, 18, 19, 20, 21]) {
    weights[h] = 2.5;
  }
  return weights;
}

function pickWeighted(rng: Rng, weights: number[]): number {
  const total = weights.reduce((sum, value) => sum + value, 0);
  const target = rng.next() * total;
  let acc = 0;
  for (let i = 0; i < weights.length; i += 1) {
    acc += weights[i] ?? 0;
    if (target <= acc) {
      return i;
    }
  }
  return weights.length - 1;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
