import { describe, expect, it, vi } from 'vitest';
import {
  buildDeezerAlbumQuery,
  buildDeezerArtistQuery,
  createDeezerArtworkFetcher,
  runDeezerMediaBackfill,
  stripAlbumEdition,
  type DeezerArtworkFetcher,
  type DeezerMediaBackfillPrisma,
} from './backfill-media-deezer';

describe('deezer media backfill', () => {
  it('updates missing album and artist images through Deezer search', async () => {
    const albums = Array.from({ length: 3 }, (_, index) => ({
      id: index + 1,
      imageUrl: null,
      name: `Album ${index + 1}`,
      primaryArtist: { name: `Artist ${index + 1}` },
    }));
    const artists = Array.from({ length: 2 }, (_, index) => ({
      id: index + 1,
      imageUrl: null,
      name: `Artist ${index + 1}`,
    }));
    const artworkFetcher: DeezerArtworkFetcher = {
      getAlbumImage: vi.fn(
        async (album: string, artist: string) =>
          `https://cdn.deezer.com/album/${encodeURIComponent(`${artist}-${album}`)}.jpg`,
      ),
      getArtistImage: vi.fn(
        async (artist: string) => `https://cdn.deezer.com/artist/${encodeURIComponent(artist)}.jpg`,
      ),
    };
    const prisma = createPrisma({ albums, artists });

    await expect(
      runDeezerMediaBackfill(prisma, { batchSize: 100, artworkFetcher }),
    ).resolves.toMatchObject({
      albumLookupFailures: 0,
      albumsScanned: 3,
      albumsSkipped: 0,
      albumsUpdated: 3,
      artistLookupFailures: 0,
      artistsScanned: 2,
      artistsSkipped: 0,
      artistsUpdated: 2,
    });

    expect(artworkFetcher.getAlbumImage).toHaveBeenCalledTimes(3);
    expect(artworkFetcher.getAlbumImage).toHaveBeenNthCalledWith(1, 'Album 1', 'Artist 1');
    expect(artworkFetcher.getArtistImage).toHaveBeenCalledTimes(2);
    expect(artworkFetcher.getArtistImage).toHaveBeenNthCalledWith(1, 'Artist 1');
    expect(prisma.album.update).toHaveBeenCalledTimes(3);
    expect(prisma.artist.update).toHaveBeenCalledTimes(2);
  });

  it('counts a missing search result as a skip rather than an update', async () => {
    const artworkFetcher: DeezerArtworkFetcher = {
      getAlbumImage: vi.fn(async () => null),
      getArtistImage: vi.fn(async () => null),
    };
    const prisma = createPrisma({
      albums: [{ id: 1, imageUrl: null, name: 'Obscure', primaryArtist: { name: 'Nobody' } }],
      artists: [{ id: 1, imageUrl: null, name: 'Nobody' }],
    });

    await expect(
      runDeezerMediaBackfill(prisma, { batchSize: 10, artworkFetcher }),
    ).resolves.toMatchObject({
      albumsScanned: 1,
      albumsSkipped: 1,
      albumsUpdated: 1 - 1,
      artistsScanned: 1,
      artistsSkipped: 1,
      artistsUpdated: 0,
    });

    expect(prisma.album.update).not.toHaveBeenCalled();
    expect(prisma.artist.update).not.toHaveBeenCalled();
  });

  it('skips existing image URLs unless overwrite is explicitly enabled', async () => {
    const artworkFetcher: DeezerArtworkFetcher = {
      getAlbumImage: vi.fn(async () => 'https://cdn.deezer.com/album/new.jpg'),
      getArtistImage: vi.fn(async () => 'https://cdn.deezer.com/artist/new.jpg'),
    };
    const existingAlbums = [
      {
        id: 1,
        imageUrl: 'https://example.com/existing-album.jpg',
        name: 'Album 1',
        primaryArtist: { name: 'Artist 1' },
      },
    ];
    const existingArtists = [
      { id: 1, imageUrl: 'https://example.com/existing-artist.jpg', name: 'Artist 1' },
    ];
    const skipPrisma = createPrisma({ albums: existingAlbums, artists: existingArtists });

    await expect(
      runDeezerMediaBackfill(skipPrisma, { batchSize: 10, artworkFetcher }),
    ).resolves.toMatchObject({
      albumsScanned: 0,
      albumsUpdated: 0,
      artistsScanned: 0,
      artistsUpdated: 0,
    });

    expect(skipPrisma.album.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { gt: 0 }, imageUrl: null } }),
    );
    expect(skipPrisma.album.update).not.toHaveBeenCalled();
    expect(skipPrisma.artist.update).not.toHaveBeenCalled();

    const overwritePrisma = createPrisma({ albums: existingAlbums, artists: existingArtists });
    await expect(
      runDeezerMediaBackfill(overwritePrisma, {
        batchSize: 10,
        artworkFetcher,
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

  it('builds advanced album queries and plain artist queries', () => {
    expect(buildDeezerAlbumQuery('25', 'Adele')).toBe('artist:"Adele" album:"25"');
    expect(buildDeezerAlbumQuery('Untitled', '')).toBe('album:"Untitled"');
    expect(buildDeezerAlbumQuery('  ', 'Adele')).toBeNull();
    expect(buildDeezerAlbumQuery('A "Live" Set', 'Sigur Rós')).toBe(
      'artist:"Sigur Rós" album:"A Live Set"',
    );
    expect(buildDeezerArtistQuery('Adele')).toBe('Adele');
    expect(buildDeezerArtistQuery('   ')).toBeNull();
  });

  it('strips edition and version qualifiers for fallback album search', () => {
    expect(stripAlbumEdition('In Utero - 20th Anniversary Remaster')).toBe('In Utero');
    expect(stripAlbumEdition('Make Yourself - Tour Edition')).toBe('Make Yourself');
    expect(stripAlbumEdition('Nevermind (Deluxe Edition)')).toBe('Nevermind');
    expect(stripAlbumEdition('Songs (Remastered) [2011]')).toBe('Songs');
    expect(stripAlbumEdition('Vitalogy')).toBe('Vitalogy');
  });
});

describe('deezer artwork fetcher', () => {
  it('returns the largest available cover from the first album result', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            id: 302127,
            cover: 'https://cdn.deezer.com/album/small.jpg',
            cover_big: 'https://cdn.deezer.com/album/big.jpg',
            cover_xl: 'https://cdn.deezer.com/album/xl.jpg',
          },
        ],
        total: 1,
      }),
    );
    const fetcher = createDeezerArtworkFetcher({ fetch, requestIntervalMs: 0 });

    await expect(fetcher.getAlbumImage('25', 'Adele')).resolves.toBe(
      'https://cdn.deezer.com/album/xl.jpg',
    );

    const [requestedUrl] = fetch.mock.calls[0] as [URL];
    expect(requestedUrl.pathname).toBe('/search/album');
    expect(requestedUrl.searchParams.get('q')).toBe('artist:"Adele" album:"25"');
    expect(requestedUrl.searchParams.get('limit')).toBe('1');
  });

  it('retries album search on the base title when the edition-suffixed title misses', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ data: [], total: 0 }))
      .mockResolvedValueOnce(
        jsonResponse({
          data: [{ id: 1, cover_xl: 'https://cdn.deezer.com/album/xl.jpg' }],
          total: 1,
        }),
      );
    const fetcher = createDeezerArtworkFetcher({ fetch, requestIntervalMs: 0 });

    await expect(
      fetcher.getAlbumImage('In Utero - 20th Anniversary Remaster', 'Nirvana'),
    ).resolves.toBe('https://cdn.deezer.com/album/xl.jpg');

    expect(fetch).toHaveBeenCalledTimes(2);
    const [firstUrl] = fetch.mock.calls[0] as [URL];
    const [secondUrl] = fetch.mock.calls[1] as [URL];
    expect(firstUrl.searchParams.get('q')).toBe(
      'artist:"Nirvana" album:"In Utero - 20th Anniversary Remaster"',
    );
    expect(secondUrl.searchParams.get('q')).toBe('artist:"Nirvana" album:"In Utero"');
  });

  it('returns null when Deezer has no matching results', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(jsonResponse({ data: [], total: 0 }));
    const fetcher = createDeezerArtworkFetcher({ fetch, requestIntervalMs: 0 });

    await expect(fetcher.getArtistImage('No Such Artist 9999')).resolves.toBeNull();
  });

  it('treats Deezer placeholder artwork as missing', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            id: 0,
            picture_xl: 'https://e-cdns-images.dzcdn.net/images/artist//1000x1000-000.jpg',
          },
        ],
        total: 1,
      }),
    );
    const fetcher = createDeezerArtworkFetcher({ fetch, requestIntervalMs: 0 });

    await expect(fetcher.getArtistImage('Adele')).resolves.toBeNull();
  });

  it('backs off and retries after a Deezer quota error in the response body', async () => {
    const delay = vi.fn().mockResolvedValue(undefined);
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ error: { type: 'Exception', message: 'Quota limit exceeded', code: 4 } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          data: [{ id: 1, cover_xl: 'https://cdn.deezer.com/album/xl.jpg' }],
          total: 1,
        }),
      );
    const fetcher = createDeezerArtworkFetcher({
      delay,
      fetch,
      quotaBackoffMs: 5000,
      requestIntervalMs: 0,
    });

    await expect(fetcher.getAlbumImage('25', 'Adele')).resolves.toBe(
      'https://cdn.deezer.com/album/xl.jpg',
    );

    expect(delay).toHaveBeenCalledWith(5000);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('includes Deezer response text when an HTTP request fails', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('Service Unavailable', { status: 503 }));
    const fetcher = createDeezerArtworkFetcher({ fetch, requestIntervalMs: 0 });

    await expect(fetcher.getArtistImage('Adele')).rejects.toThrow(
      /Deezer request failed with status 503/,
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
  albums: Array<{
    id: number;
    imageUrl: string | null;
    name: string;
    primaryArtist: { name: string };
  }>;
  artists: Array<{ id: number; imageUrl: string | null; name: string }>;
}): DeezerMediaBackfillPrisma {
  return {
    album: {
      findMany: vi.fn(async (args) => filterRecords(albums, args)),
      update: vi.fn().mockResolvedValue({}),
    },
    artist: {
      findMany: vi.fn(async (args) => filterRecords(artists, args)),
      update: vi.fn().mockResolvedValue({}),
    },
  } as unknown as DeezerMediaBackfillPrisma;
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
