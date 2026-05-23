import type { PrismaClient } from '@prisma/client';
import { SEED_USERS, SEED_USER_PASSWORD } from './data';
import {
  DEFAULT_SEED_COUNTS,
  generateCorpus,
  type SeedAlbum,
  type SeedArtist,
  type SeedCorpus,
  type SeedCounts,
  type SeedMpdPlaylist,
  type SeedTrack,
} from './generate';
import { hashPassword } from './passwords';

export interface SeedRunOptions {
  counts?: SeedCounts;
  logger?: SeedLogger;
}

export interface SeedLogger {
  info(message: string): void;
  warn(message: string): void;
}

export interface SeedRunResult {
  users: number;
  artists: number;
  albums: number;
  tracks: number;
  playlists: number;
  playlistTracks: number;
  history: number;
}

const SILENT_LOGGER: SeedLogger = { info() {}, warn() {} };

const BATCH_SIZE = 500;

const TRUNCATE_ORDER = [
  'listening_history',
  'mpd_playlist_tracks',
  'mpd_playlists',
  'track_artists',
  'tracks',
  'albums',
  'artists',
  'audit_log',
  'refresh_tokens',
  'user_playlist_tracks',
  'user_playlists',
  'users',
] as const;

export async function runSeed(
  prisma: PrismaClient,
  options: SeedRunOptions = {},
): Promise<SeedRunResult> {
  const counts = options.counts ?? DEFAULT_SEED_COUNTS;
  const logger = options.logger ?? SILENT_LOGGER;

  logger.warn(`Truncating ${TRUNCATE_ORDER.length} tables before seeding`);
  await truncate(prisma);

  logger.info('Hashing seed user passwords');
  const passwordHash = await hashPassword(SEED_USER_PASSWORD);
  const userRows = SEED_USERS.slice(0, counts.users).map((u) => ({
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    passwordHash,
  }));
  await prisma.user.createMany({ data: userRows });
  logger.info(`Inserted ${userRows.length} users (shared password: ${SEED_USER_PASSWORD})`);

  const users = await prisma.user.findMany({
    where: { email: { in: userRows.map((u) => u.email) } },
    orderBy: { id: 'asc' },
    select: { id: true, email: true },
  });
  const userIdByEmail = new Map(users.map((u) => [u.email, u.id]));

  const corpus = generateCorpus(counts);

  const artistIds = await insertArtists(prisma, corpus.artists);
  logger.info(`Inserted ${corpus.artists.length} artists`);

  const albumIds = await insertAlbums(prisma, corpus.albums, artistIds);
  logger.info(`Inserted ${corpus.albums.length} albums`);

  const trackIds = await insertTracks(prisma, corpus.tracks, albumIds);
  logger.info(`Inserted ${corpus.tracks.length} tracks`);

  await insertTrackArtists(prisma, corpus.tracks, trackIds, artistIds);
  logger.info(`Inserted ${corpus.tracks.length} track_artists`);

  const playlistIds = await insertPlaylists(prisma, corpus.playlists);
  logger.info(`Inserted ${corpus.playlists.length} mpd_playlists`);

  await insertPlaylistTracks(prisma, corpus.playlistTracks, playlistIds, trackIds);
  logger.info(`Inserted ${corpus.playlistTracks.length} mpd_playlist_tracks`);

  const historyCount = await insertHistory(prisma, corpus, trackIds, userIdByEmail);
  logger.info(`Inserted ${historyCount} listening_history rows`);

  return {
    users: userRows.length,
    artists: corpus.artists.length,
    albums: corpus.albums.length,
    tracks: corpus.tracks.length,
    playlists: corpus.playlists.length,
    playlistTracks: corpus.playlistTracks.length,
    history: historyCount,
  };
}

async function truncate(prisma: PrismaClient): Promise<void> {
  const quoted = TRUNCATE_ORDER.map((name) => `"${name}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`);
}

async function insertArtists(
  prisma: PrismaClient,
  artists: SeedArtist[],
): Promise<Map<string, number>> {
  for (const chunk of chunked(artists, BATCH_SIZE)) {
    await prisma.artist.createMany({
      data: chunk.map((a) => ({
        spotifyUri: a.spotifyUri,
        name: a.name,
        normalizedName: a.normalizedName,
      })),
    });
  }
  const rows = await prisma.artist.findMany({
    where: { spotifyUri: { in: artists.map((a) => a.spotifyUri) } },
    select: { id: true, spotifyUri: true },
  });
  return new Map(rows.map((r) => [r.spotifyUri, r.id]));
}

async function insertAlbums(
  prisma: PrismaClient,
  albums: SeedAlbum[],
  artistIds: Map<string, number>,
): Promise<Map<string, number>> {
  for (const chunk of chunked(albums, BATCH_SIZE)) {
    await prisma.album.createMany({
      data: chunk.map((a) => ({
        spotifyUri: a.spotifyUri,
        name: a.name,
        primaryArtistId: requireId(artistIds, a.primaryArtistSpotifyUri, 'artist'),
      })),
    });
  }
  const rows = await prisma.album.findMany({
    where: { spotifyUri: { in: albums.map((a) => a.spotifyUri) } },
    select: { id: true, spotifyUri: true },
  });
  return new Map(rows.map((r) => [r.spotifyUri, r.id]));
}

async function insertTracks(
  prisma: PrismaClient,
  tracks: SeedTrack[],
  albumIds: Map<string, number>,
): Promise<Map<string, number>> {
  for (const chunk of chunked(tracks, BATCH_SIZE)) {
    await prisma.track.createMany({
      data: chunk.map((t) => ({
        spotifyUri: t.spotifyUri,
        name: t.name,
        albumId: requireId(albumIds, t.albumSpotifyUri, 'album'),
        durationMs: t.durationMs,
      })),
    });
  }
  const rows = await prisma.track.findMany({
    where: { spotifyUri: { in: tracks.map((t) => t.spotifyUri) } },
    select: { id: true, spotifyUri: true },
  });
  return new Map(rows.map((r) => [r.spotifyUri, r.id]));
}

async function insertTrackArtists(
  prisma: PrismaClient,
  tracks: SeedTrack[],
  trackIds: Map<string, number>,
  artistIds: Map<string, number>,
): Promise<void> {
  const rows = tracks.map((t) => ({
    trackId: requireId(trackIds, t.spotifyUri, 'track'),
    artistId: requireId(artistIds, t.primaryArtistSpotifyUri, 'artist'),
    role: 'primary' as const,
  }));
  for (const chunk of chunked(rows, BATCH_SIZE)) {
    await prisma.trackArtist.createMany({ data: chunk });
  }
}

async function insertPlaylists(
  prisma: PrismaClient,
  playlists: SeedMpdPlaylist[],
): Promise<Map<number, number>> {
  for (const chunk of chunked(playlists, BATCH_SIZE)) {
    await prisma.mpdPlaylist.createMany({
      data: chunk.map((p) => ({
        mpdPid: p.mpdPid,
        name: p.name,
        collaborative: p.collaborative,
        modifiedAt: p.modifiedAt,
        numFollowers: p.numFollowers,
        numEdits: p.numEdits,
        durationMs: p.durationMs,
      })),
    });
  }
  const rows = await prisma.mpdPlaylist.findMany({
    where: { mpdPid: { in: playlists.map((p) => p.mpdPid) } },
    select: { id: true, mpdPid: true },
  });
  return new Map(rows.map((r) => [r.mpdPid, r.id]));
}

async function insertPlaylistTracks(
  prisma: PrismaClient,
  entries: SeedCorpus['playlistTracks'],
  playlistIds: Map<number, number>,
  trackIds: Map<string, number>,
): Promise<void> {
  for (const chunk of chunked(entries, BATCH_SIZE)) {
    await prisma.mpdPlaylistTrack.createMany({
      data: chunk.map((e) => ({
        playlistId: requirePlaylistId(playlistIds, e.mpdPid),
        trackId: requireId(trackIds, e.trackSpotifyUri, 'track'),
        pos: e.pos,
      })),
    });
  }
}

async function insertHistory(
  prisma: PrismaClient,
  corpus: SeedCorpus,
  trackIds: Map<string, number>,
  userIdByEmail: Map<string, number>,
): Promise<number> {
  const userIdByIndex = new Map<number, number>();
  SEED_USERS.forEach((user, i) => {
    const id = userIdByEmail.get(user.email);
    if (id !== undefined) {
      userIdByIndex.set(i + 1, id);
    }
  });

  const rows = corpus.history
    .filter((entry) => userIdByIndex.has(entry.userIndex))
    .map((entry) => ({
      userId: userIdByIndex.get(entry.userIndex) as number,
      trackId: requireId(trackIds, entry.trackSpotifyUri, 'track'),
      playedAt: entry.playedAt,
      source: entry.source,
      durationPlayedMs: entry.durationPlayedMs,
    }));

  for (const chunk of chunked(rows, BATCH_SIZE)) {
    await prisma.listeningHistory.createMany({ data: chunk });
  }

  return rows.length;
}

export function* chunked<T>(items: T[], size: number): IterableIterator<T[]> {
  if (size <= 0) {
    throw new Error(`chunked: size must be > 0, got ${size}`);
  }
  for (let i = 0; i < items.length; i += size) {
    yield items.slice(i, i + size);
  }
}

function requireId(map: Map<string, number>, key: string, kind: string): number {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`Missing ${kind} id for ${key}`);
  }
  return value;
}

function requirePlaylistId(map: Map<number, number>, mpdPid: number): number {
  const value = map.get(mpdPid);
  if (value === undefined) {
    throw new Error(`Missing playlist id for mpd_pid ${mpdPid}`);
  }
  return value;
}
