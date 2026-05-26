import { describe, expect, it, vi } from 'vitest';
import {
  createSpotifyCatalogFetcher,
  parseSpotifyUri,
  runMediaBackfill,
  type MediaBackfillPrisma,
  type SpotifyCatalogFetcher,
} from './backfill-media';

describe('media backfill', () => {
  it('updates missing album and artist images one Spotify ID per request', async () => {
    const albums = Array.from({ length: 21 }, (_, index) => ({
      id: index + 1,
      imageUrl: null,
      spotifyUri: `spotify:album:album-${index + 1}`,
    }));
    const artists = Array.from({ length: 51 }, (_, index) => ({
      id: index + 1,
      imageUrl: null,
      spotifyUri: `spotify:artist:artist-${index + 1}`,
    }));
    const catalogFetcher: SpotifyCatalogFetcher = {
      getAlbums: vi.fn(async (ids: string[]) =>
        ids.map((id) => ({ id, imageUrl: `https://i.scdn.co/image/${id}` })),
      ),
      getArtists: vi.fn(async (ids: string[]) =>
        ids.map((id) => ({ id, imageUrl: `https://i.scdn.co/image/${id}` })),
      ),
    };
    const prisma = createPrisma({ albums, artists });

    await expect(
      runMediaBackfill(prisma, { batchSize: 100, catalogFetcher }),
    ).resolves.toMatchObject({
      albumLookupFailures: 0,
      albumsScanned: 21,
      albumsSkipped: 0,
      albumsUpdated: 21,
      artistLookupFailures: 0,
      artistsScanned: 51,
      artistsSkipped: 0,
      artistsUpdated: 51,
    });

    // Spotify dev-mode quota forces one ID per request, so each entity is its own call.
    expect(catalogFetcher.getAlbums).toHaveBeenCalledTimes(21);
    expect(catalogFetcher.getAlbums).toHaveBeenNthCalledWith(1, ['album-1']);
    expect(catalogFetcher.getAlbums).toHaveBeenNthCalledWith(21, ['album-21']);
    expect(catalogFetcher.getArtists).toHaveBeenCalledTimes(51);
    expect(catalogFetcher.getArtists).toHaveBeenNthCalledWith(1, ['artist-1']);
    expect(catalogFetcher.getArtists).toHaveBeenNthCalledWith(51, ['artist-51']);
    expect(prisma.album.update).toHaveBeenCalledTimes(21);
    expect(prisma.artist.update).toHaveBeenCalledTimes(51);
  });

  it('skips existing image URLs unless overwrite is explicitly enabled', async () => {
    const catalogFetcher: SpotifyCatalogFetcher = {
      getAlbums: vi.fn(async (ids: string[]) =>
        ids.map((id) => ({ id, imageUrl: `https://i.scdn.co/image/${id}` })),
      ),
      getArtists: vi.fn(async (ids: string[]) =>
        ids.map((id) => ({ id, imageUrl: `https://i.scdn.co/image/${id}` })),
      ),
    };
    const existingAlbums = [
      {
        id: 1,
        imageUrl: 'https://example.com/existing-album.jpg',
        spotifyUri: 'spotify:album:album-1',
      },
    ];
    const existingArtists = [
      {
        id: 1,
        imageUrl: 'https://example.com/existing-artist.jpg',
        spotifyUri: 'spotify:artist:artist-1',
      },
    ];
    const skipPrisma = createPrisma({ albums: existingAlbums, artists: existingArtists });

    await expect(
      runMediaBackfill(skipPrisma, { batchSize: 10, catalogFetcher }),
    ).resolves.toMatchObject({
      albumsScanned: 0,
      albumsUpdated: 0,
      artistsScanned: 0,
      artistsUpdated: 0,
    });

    expect(skipPrisma.album.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { gt: 0 }, imageUrl: null } }),
    );
    expect(skipPrisma.artist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { gt: 0 }, imageUrl: null } }),
    );
    expect(skipPrisma.album.update).not.toHaveBeenCalled();
    expect(skipPrisma.artist.update).not.toHaveBeenCalled();

    const overwritePrisma = createPrisma({ albums: existingAlbums, artists: existingArtists });
    await expect(
      runMediaBackfill(overwritePrisma, {
        batchSize: 10,
        catalogFetcher,
        overwriteExisting: true,
      }),
    ).resolves.toMatchObject({
      albumsScanned: 1,
      albumsUpdated: 1,
      artistsScanned: 1,
      artistsUpdated: 1,
    });

    expect(overwritePrisma.album.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { gt: 0 } } }),
    );
    expect(overwritePrisma.artist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { gt: 0 } } }),
    );
  });

  it('parses only Spotify URIs for the expected entity kind', () => {
    expect(parseSpotifyUri('spotify:album:abc123', 'album')).toBe('abc123');
    expect(parseSpotifyUri('spotify:artist:def456', 'artist')).toBe('def456');
    expect(parseSpotifyUri('spotify:track:def456', 'artist')).toBeNull();
    expect(parseSpotifyUri('https://open.spotify.com/album/abc123', 'album')).toBeNull();
    expect(parseSpotifyUri('spotify:album:', 'album')).toBeNull();
  });

  it('backs off and retries Spotify requests after a 429 Retry-After response', async () => {
    const delay = vi.fn().mockResolvedValue(undefined);
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: 'token',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      )
      .mockResolvedValueOnce(
        new Response('{}', {
          headers: { 'Retry-After': '2' },
          status: 429,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          id: 'album-1',
          images: [{ url: 'https://i.scdn.co/image/album-1' }],
        }),
      );
    const fetcher = createSpotifyCatalogFetcher({
      clientId: 'client-id',
      clientSecret: 'client-secret',
      delay,
      fetch,
      requestIntervalMs: 0,
    });

    await expect(fetcher.getAlbums(['album-1'])).resolves.toEqual([
      { id: 'album-1', imageUrl: 'https://i.scdn.co/image/album-1' },
    ]);

    expect(delay).toHaveBeenCalledWith(2000);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('includes Spotify response text when a request fails', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          access_token: 'token',
          expires_in: 3600,
          token_type: 'bearer',
        }),
      )
      .mockResolvedValueOnce(
        new Response('Active premium subscription required for the owner of the app.', {
          status: 403,
        }),
      );
    const fetcher = createSpotifyCatalogFetcher({
      clientId: 'client-id',
      clientSecret: 'client-secret',
      fetch,
      requestIntervalMs: 0,
    });

    await expect(fetcher.getAlbums(['album-1'])).rejects.toThrow(
      /Active premium subscription required/,
    );
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}

function createPrisma({
  albums,
  artists,
}: {
  albums: Array<{ id: number; imageUrl: string | null; spotifyUri: string }>;
  artists: Array<{ id: number; imageUrl: string | null; spotifyUri: string }>;
}): MediaBackfillPrisma {
  return {
    album: {
      findMany: vi.fn(async (args) => filterRecords(albums, args)),
      update: vi.fn().mockResolvedValue({}),
    },
    artist: {
      findMany: vi.fn(async (args) => filterRecords(artists, args)),
      update: vi.fn().mockResolvedValue({}),
    },
  } as unknown as MediaBackfillPrisma;
}

function filterRecords<T extends { id: number; imageUrl: string | null }>(
  records: T[],
  args: {
    take?: number;
    where?: {
      id?: { gt?: number };
      imageUrl?: null;
    };
  },
): T[] {
  const minId = args.where?.id?.gt ?? 0;
  const filtered = records.filter(
    (record) =>
      record.id > minId && (args.where?.imageUrl === null ? record.imageUrl === null : true),
  );

  return filtered.slice(0, args.take);
}
