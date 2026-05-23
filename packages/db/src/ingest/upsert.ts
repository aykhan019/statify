import type { PrismaClient } from '@prisma/client';
import type {
  IngestCounts,
  NormalizedAlbum,
  NormalizedArtist,
  NormalizedPlaylist,
  NormalizedPlaylistTrack,
  NormalizedSlice,
  NormalizedTrack,
  NormalizedTrackArtist,
} from './types';

export const DEFAULT_BATCH_SIZE = 500;

export interface UpsertOptions {
  batchSize?: number;
}

export async function upsertSlice(
  prisma: PrismaClient,
  slice: NormalizedSlice,
  options: UpsertOptions = {},
): Promise<IngestCounts> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;

  const artists = await upsertArtists(prisma, slice.artists, batchSize);
  const albums = await upsertAlbums(prisma, slice.albums, artists, batchSize);
  const tracks = await upsertTracks(prisma, slice.tracks, albums, batchSize);
  await upsertTrackArtists(prisma, slice.trackArtists, tracks, artists, batchSize);
  const playlists = await upsertPlaylists(prisma, slice.playlists, batchSize);
  await upsertPlaylistTracks(prisma, slice.playlistTracks, playlists, tracks, batchSize);

  return {
    artists: artists.size,
    albums: albums.size,
    tracks: tracks.size,
    playlists: playlists.size,
  };
}

async function upsertArtists(
  prisma: PrismaClient,
  artists: NormalizedArtist[],
  batchSize: number,
): Promise<Map<string, number>> {
  const ids = new Map<string, number>();
  for (const chunk of chunked(artists, batchSize)) {
    await prisma.artist.createMany({
      data: chunk.map((artist) => ({
        spotifyUri: artist.spotifyUri,
        name: artist.name,
        normalizedName: artist.normalizedName,
      })),
      skipDuplicates: true,
    });
    const rows = await prisma.artist.findMany({
      where: { spotifyUri: { in: chunk.map((artist) => artist.spotifyUri) } },
      select: { id: true, spotifyUri: true },
    });
    for (const row of rows) {
      ids.set(row.spotifyUri, row.id);
    }
  }
  return ids;
}

async function upsertAlbums(
  prisma: PrismaClient,
  albums: NormalizedAlbum[],
  artistIds: Map<string, number>,
  batchSize: number,
): Promise<Map<string, number>> {
  const ids = new Map<string, number>();
  for (const chunk of chunked(albums, batchSize)) {
    await prisma.album.createMany({
      data: chunk.map((album) => ({
        spotifyUri: album.spotifyUri,
        name: album.name,
        primaryArtistId: requireId(artistIds, album.primaryArtistSpotifyUri, 'artist'),
      })),
      skipDuplicates: true,
    });
    const rows = await prisma.album.findMany({
      where: { spotifyUri: { in: chunk.map((album) => album.spotifyUri) } },
      select: { id: true, spotifyUri: true },
    });
    for (const row of rows) {
      ids.set(row.spotifyUri, row.id);
    }
  }
  return ids;
}

async function upsertTracks(
  prisma: PrismaClient,
  tracks: NormalizedTrack[],
  albumIds: Map<string, number>,
  batchSize: number,
): Promise<Map<string, number>> {
  const ids = new Map<string, number>();
  for (const chunk of chunked(tracks, batchSize)) {
    await prisma.track.createMany({
      data: chunk.map((track) => ({
        spotifyUri: track.spotifyUri,
        name: track.name,
        albumId: requireId(albumIds, track.albumSpotifyUri, 'album'),
        durationMs: track.durationMs,
      })),
      skipDuplicates: true,
    });
    const rows = await prisma.track.findMany({
      where: { spotifyUri: { in: chunk.map((track) => track.spotifyUri) } },
      select: { id: true, spotifyUri: true },
    });
    for (const row of rows) {
      ids.set(row.spotifyUri, row.id);
    }
  }
  return ids;
}

async function upsertTrackArtists(
  prisma: PrismaClient,
  trackArtists: NormalizedTrackArtist[],
  trackIds: Map<string, number>,
  artistIds: Map<string, number>,
  batchSize: number,
): Promise<void> {
  for (const chunk of chunked(trackArtists, batchSize)) {
    await prisma.trackArtist.createMany({
      data: chunk.map((ta) => ({
        trackId: requireId(trackIds, ta.trackSpotifyUri, 'track'),
        artistId: requireId(artistIds, ta.artistSpotifyUri, 'artist'),
        role: ta.role,
      })),
      skipDuplicates: true,
    });
  }
}

async function upsertPlaylists(
  prisma: PrismaClient,
  playlists: NormalizedPlaylist[],
  batchSize: number,
): Promise<Map<number, number>> {
  const ids = new Map<number, number>();
  for (const chunk of chunked(playlists, batchSize)) {
    await prisma.mpdPlaylist.createMany({
      data: chunk.map((playlist) => ({
        mpdPid: playlist.mpdPid,
        name: playlist.name,
        collaborative: playlist.collaborative,
        modifiedAt: playlist.modifiedAt,
        numFollowers: playlist.numFollowers,
        numEdits: playlist.numEdits,
        durationMs: playlist.durationMs,
      })),
      skipDuplicates: true,
    });
    const rows = await prisma.mpdPlaylist.findMany({
      where: { mpdPid: { in: chunk.map((p) => p.mpdPid) } },
      select: { id: true, mpdPid: true },
    });
    for (const row of rows) {
      ids.set(row.mpdPid, row.id);
    }
  }
  return ids;
}

async function upsertPlaylistTracks(
  prisma: PrismaClient,
  rows: NormalizedPlaylistTrack[],
  playlistIds: Map<number, number>,
  trackIds: Map<string, number>,
  batchSize: number,
): Promise<void> {
  for (const chunk of chunked(rows, batchSize)) {
    await prisma.mpdPlaylistTrack.createMany({
      data: chunk.map((row) => ({
        playlistId: requireMappedId(playlistIds, row.mpdPid, 'playlist'),
        trackId: requireId(trackIds, row.trackSpotifyUri, 'track'),
        pos: row.pos,
      })),
      skipDuplicates: true,
    });
  }
}

export function* chunked<T>(items: T[], size: number): IterableIterator<T[]> {
  if (size <= 0) {
    throw new Error(`batchSize must be > 0, got ${size}`);
  }
  for (let i = 0; i < items.length; i += size) {
    yield items.slice(i, i + size);
  }
}

function requireId(map: Map<string, number>, key: string, kind: string): number {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`Missing ${kind} id for spotify uri ${key}`);
  }
  return value;
}

function requireMappedId(map: Map<number, number>, key: number, kind: string): number {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`Missing ${kind} id for mpd pid ${key}`);
  }
  return value;
}
