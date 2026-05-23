import { ErrorCode } from '@statify/shared';
import { describe, expect, it, vi } from 'vitest';
import { ItunesAdapter } from './itunes.adapter';
import type { ItunesCache, ItunesCacheRecord, ItunesTrackForPreview } from './itunes.cache';
import type { ItunesClient } from './itunes.client';
import { ItunesService } from './itunes.service';

describe('ItunesService', () => {
  it('returns an available cached preview without calling the client', async () => {
    const fetchedAt = new Date('2026-01-01T00:00:00.000Z');
    const cache = createCache({
      findTrackForPreview: vi.fn().mockResolvedValue(
        createTrack({
          itunesTrackId: 123n,
          previewFetchedAt: fetchedAt,
          previewUrl: 'https://example.com/preview.m4a',
        }),
      ),
    });
    const client = createClient();
    const service = new ItunesService(new ItunesAdapter(), cache, client);

    await expect(service.resolvePreview(1)).resolves.toEqual({
      itunesTrackId: 123n,
      previewFetchedAt: fetchedAt,
      previewUrl: 'https://example.com/preview.m4a',
      source: 'cache',
      status: 'available',
      trackId: 1,
    });
    expect(client.searchSongs).not.toHaveBeenCalled();
  });

  it('returns a recent unavailable cache entry without retrying', async () => {
    const fetchedAt = new Date();
    const cache = createCache({
      findTrackForPreview: vi.fn().mockResolvedValue(
        createTrack({
          previewFetchedAt: fetchedAt,
          previewUrl: null,
        }),
      ),
    });
    const client = createClient();
    const service = new ItunesService(new ItunesAdapter(), cache, client);

    await expect(service.resolvePreview(1)).resolves.toMatchObject({
      previewFetchedAt: fetchedAt,
      previewUrl: null,
      source: 'cache',
      status: 'unavailable',
      trackId: 1,
    });
    expect(client.searchSongs).not.toHaveBeenCalled();
  });

  it('looks up and persists previews when the cache is stale', async () => {
    const staleFetchedAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const savedAt = new Date('2026-01-02T00:00:00.000Z');
    const cache = createCache({
      findTrackForPreview: vi.fn().mockResolvedValue(
        createTrack({
          previewFetchedAt: staleFetchedAt,
          previewUrl: null,
        }),
      ),
      savePreview: vi.fn().mockResolvedValue(
        createCacheRecord({
          itunesTrackId: 456n,
          previewFetchedAt: savedAt,
          previewUrl: 'https://example.com/new-preview.m4a',
        }),
      ),
    });
    const client = createClient({
      searchSongs: vi.fn().mockResolvedValue({
        resultCount: 1,
        results: [
          {
            previewUrl: 'https://example.com/new-preview.m4a',
            trackId: 456,
          },
        ],
      }),
    });
    const service = new ItunesService(new ItunesAdapter(), cache, client);

    await expect(service.resolvePreview(1)).resolves.toMatchObject({
      itunesTrackId: 456n,
      previewUrl: 'https://example.com/new-preview.m4a',
      source: 'lookup',
      status: 'available',
      trackId: 1,
    });
    expect(client.searchSongs).toHaveBeenCalledWith({ term: 'Track Artist' });
    expect(cache.savePreview).toHaveBeenCalledWith(
      1,
      {
        itunesTrackId: 456,
        previewUrl: 'https://example.com/new-preview.m4a',
      },
      expect.any(Date),
    );
  });

  it('marks the lookup unavailable when the client fails', async () => {
    const cache = createCache({
      findTrackForPreview: vi.fn().mockResolvedValue(
        createTrack({
          previewFetchedAt: null,
          previewUrl: null,
        }),
      ),
      markUnavailable: vi.fn(async (trackId: number, fetchedAt: Date) =>
        createCacheRecord({
          id: trackId,
          previewFetchedAt: fetchedAt,
          previewUrl: null,
        }),
      ),
    });
    const client = createClient({
      searchSongs: vi.fn().mockRejectedValue(new Error('lookup failed')),
    });
    const service = new ItunesService(new ItunesAdapter(), cache, client);

    await expect(service.resolvePreview(1)).resolves.toMatchObject({
      previewUrl: null,
      source: 'lookup',
      status: 'unavailable',
      trackId: 1,
    });
    expect(cache.markUnavailable).toHaveBeenCalledWith(1, expect.any(Date));
  });

  it('throws when the track does not exist', async () => {
    const cache = createCache({
      findTrackForPreview: vi.fn().mockResolvedValue(null),
    });
    const service = new ItunesService(new ItunesAdapter(), cache, createClient());

    await expect(service.resolvePreview(404)).rejects.toMatchObject({
      code: ErrorCode.TRACK_NOT_FOUND,
    });
  });
});

function createClient(overrides: Partial<ItunesClient> = {}): ItunesClient {
  return {
    searchSongs: vi.fn(),
    ...overrides,
  } as unknown as ItunesClient;
}

function createCache(overrides: Partial<ItunesCache> = {}): ItunesCache {
  return {
    findTrackForPreview: vi.fn(),
    markUnavailable: vi.fn(),
    savePreview: vi.fn(),
    ...overrides,
  } as unknown as ItunesCache;
}

function createTrack(overrides: Partial<ItunesTrackForPreview> = {}): ItunesTrackForPreview {
  const artist = {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 2,
    name: 'Artist',
    normalizedName: 'artist',
    spotifyUri: 'spotify:artist:2',
  };

  return {
    album: {
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      id: 3,
      name: 'Album',
      primaryArtist: artist,
      primaryArtistId: artist.id,
      spotifyUri: 'spotify:album:3',
    },
    albumId: 3,
    durationMs: 180000,
    id: 1,
    itunesTrackId: null,
    name: 'Track',
    previewFetchedAt: null,
    previewUrl: null,
    spotifyUri: 'spotify:track:1',
    trackArtists: [
      {
        artist,
        artistId: artist.id,
        role: 'primary',
        trackId: 1,
      },
    ],
    ...overrides,
  };
}

function createCacheRecord(overrides: Partial<ItunesCacheRecord> = {}): ItunesCacheRecord {
  return {
    id: 1,
    itunesTrackId: null,
    previewFetchedAt: new Date('2026-01-01T00:00:00.000Z'),
    previewUrl: null,
    ...overrides,
  };
}
