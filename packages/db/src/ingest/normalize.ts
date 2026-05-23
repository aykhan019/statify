import type {
  NormalizedAlbum,
  NormalizedArtist,
  NormalizedPlaylist,
  NormalizedPlaylistTrack,
  NormalizedSlice,
  NormalizedTrack,
  NormalizedTrackArtist,
  RawMpdPlaylist,
} from './types';

const DIACRITIC_RANGE = /[̀-ͯ]/g;
const PUNCTUATION_AND_SYMBOLS = /[^a-z0-9\s]/g;
const WHITESPACE_RUN = /\s+/g;

export function normalizePlaylists(raw: RawMpdPlaylist[]): NormalizedSlice {
  const artists = new Map<string, NormalizedArtist>();
  const albums = new Map<string, NormalizedAlbum>();
  const tracks = new Map<string, NormalizedTrack>();
  const trackArtists = new Map<string, NormalizedTrackArtist>();
  const playlists: NormalizedPlaylist[] = [];
  const playlistTracks: NormalizedPlaylistTrack[] = [];

  for (const playlist of raw) {
    playlists.push(toNormalizedPlaylist(playlist));

    for (const track of playlist.tracks) {
      if (!artists.has(track.artist_uri)) {
        artists.set(track.artist_uri, {
          spotifyUri: track.artist_uri,
          name: track.artist_name,
          normalizedName: normalizeName(track.artist_name),
        });
      }

      if (!albums.has(track.album_uri)) {
        albums.set(track.album_uri, {
          spotifyUri: track.album_uri,
          name: track.album_name,
          primaryArtistSpotifyUri: track.artist_uri,
        });
      }

      if (!tracks.has(track.track_uri)) {
        tracks.set(track.track_uri, {
          spotifyUri: track.track_uri,
          name: track.track_name,
          albumSpotifyUri: track.album_uri,
          durationMs: track.duration_ms,
        });
      }

      const taKey = `${track.track_uri}|${track.artist_uri}`;
      if (!trackArtists.has(taKey)) {
        trackArtists.set(taKey, {
          trackSpotifyUri: track.track_uri,
          artistSpotifyUri: track.artist_uri,
          role: 'primary',
        });
      }

      playlistTracks.push({
        mpdPid: playlist.pid,
        trackSpotifyUri: track.track_uri,
        pos: track.pos,
      });
    }
  }

  return {
    artists: [...artists.values()],
    albums: [...albums.values()],
    tracks: [...tracks.values()],
    trackArtists: [...trackArtists.values()],
    playlists,
    playlistTracks,
  };
}

function toNormalizedPlaylist(raw: RawMpdPlaylist): NormalizedPlaylist {
  return {
    mpdPid: raw.pid,
    name: raw.name,
    collaborative: parseCollaborative(raw.collaborative),
    modifiedAt: new Date(raw.modified_at * 1000),
    numFollowers: raw.num_followers,
    numEdits: raw.num_edits,
    durationMs: BigInt(raw.duration_ms),
  };
}

function parseCollaborative(value: string | boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return value.toLowerCase() === 'true';
}

export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(DIACRITIC_RANGE, '')
    .replace(PUNCTUATION_AND_SYMBOLS, ' ')
    .replace(WHITESPACE_RUN, ' ')
    .trim();
}
