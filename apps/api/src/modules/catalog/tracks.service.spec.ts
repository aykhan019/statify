import { ErrorCode, type TracksQuery } from '@statify/shared';
import { describe, expect, it, vi } from 'vitest';
import type { TrackCatalogRecord } from './tracks.repository';
import { TracksRepository } from './tracks.repository';
import { TracksService } from './tracks.service';

describe('TracksService', () => {
  it('maps paginated track records', async () => {
    const query = createQuery();
    const repository = {
      findById: vi.fn(),
      list: vi.fn().mockResolvedValue({ data: [createTrackRecord()], total: 1 }),
    } as unknown as TracksRepository;
    const previewProvider = { resolvePreview: vi.fn() };
    const service = new TracksService(repository, previewProvider);

    await expect(service.list(query)).resolves.toEqual({
      data: [
        {
          album: {
            id: 2,
            name: 'Album',
            primaryArtist: {
              id: 3,
              name: 'Primary Artist',
              spotifyUri: 'spotify:artist:3',
            },
            spotifyUri: 'spotify:album:2',
          },
          artists: [
            {
              id: 3,
              name: 'Primary Artist',
              role: 'primary',
              spotifyUri: 'spotify:artist:3',
            },
          ],
          durationMs: 180000,
          id: 1,
          name: 'Track',
          previewUrl: 'https://example.com/preview.m4a',
          spotifyUri: 'spotify:track:1',
        },
      ],
      limit: 20,
      page: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('throws when a track does not exist', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(null),
      list: vi.fn(),
    } as unknown as TracksRepository;
    const previewProvider = { resolvePreview: vi.fn() };
    const service = new TracksService(repository, previewProvider);

    await expect(service.getById(404)).rejects.toMatchObject({
      code: ErrorCode.TRACK_NOT_FOUND,
    });
  });
});

function createQuery(): TracksQuery {
  return {
    limit: 20,
    page: 1,
    sort: 'name',
  };
}

function createTrackRecord(): TrackCatalogRecord {
  const artist = {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 3,
    name: 'Primary Artist',
    normalizedName: 'primary artist',
    spotifyUri: 'spotify:artist:3',
  };

  return {
    album: {
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      id: 2,
      name: 'Album',
      primaryArtist: artist,
      primaryArtistId: artist.id,
      spotifyUri: 'spotify:album:2',
    },
    albumId: 2,
    durationMs: 180000,
    id: 1,
    itunesTrackId: null,
    name: 'Track',
    previewFetchedAt: null,
    previewUrl: 'https://example.com/preview.m4a',
    spotifyUri: 'spotify:track:1',
    trackArtists: [
      {
        artist,
        artistId: artist.id,
        role: 'primary',
        trackId: 1,
      },
    ],
  };
}
