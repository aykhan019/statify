import { ErrorCode, type ArtistsQuery } from '@statify/shared';
import { describe, expect, it, vi } from 'vitest';
import type { ArtistDetailRecord } from './artists.repository';
import { ArtistsRepository } from './artists.repository';
import { ArtistsService } from './artists.service';

describe('ArtistsService', () => {
  it('maps paginated artist records', async () => {
    const query: ArtistsQuery = { limit: 10, page: 1, sort: 'name' };
    const repository = {
      findById: vi.fn(),
      list: vi.fn().mockResolvedValue({
        data: [
          {
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            id: 1,
            imageUrl: null,
            name: 'Artist',
            normalizedName: 'artist',
            spotifyUri: 'spotify:artist:1',
          },
        ],
        total: 1,
      }),
    } as unknown as ArtistsRepository;
    const service = new ArtistsService(repository);

    await expect(service.list(query)).resolves.toEqual({
      data: [
        {
          id: 1,
          imageUrl: null,
          name: 'Artist',
          spotifyUri: 'spotify:artist:1',
        },
      ],
      limit: 10,
      page: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('maps artist details', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(createArtistDetailRecord()),
      list: vi.fn(),
    } as unknown as ArtistsRepository;
    const service = new ArtistsService(repository);

    await expect(service.getById(1)).resolves.toEqual({
      albumCount: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 1,
      imageUrl: null,
      name: 'Artist',
      spotifyUri: 'spotify:artist:1',
      trackCount: 5,
    });
  });

  it('throws when an artist does not exist', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(null),
      list: vi.fn(),
    } as unknown as ArtistsRepository;
    const service = new ArtistsService(repository);

    await expect(service.getById(404)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });
});

function createArtistDetailRecord(): ArtistDetailRecord {
  return {
    _count: {
      albums: 2,
      trackArtists: 5,
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 1,
    imageUrl: null,
    name: 'Artist',
    normalizedName: 'artist',
    spotifyUri: 'spotify:artist:1',
  };
}
