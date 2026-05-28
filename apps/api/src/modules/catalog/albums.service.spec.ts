import { ErrorCode, type AlbumsQuery } from '@statify/shared';
import { describe, expect, it, vi } from 'vitest';
import { AlbumsRepository, type AlbumDetailRecord } from './albums.repository';
import { AlbumsService } from './albums.service';

describe('AlbumsService', () => {
  it('maps paginated album records', async () => {
    const query: AlbumsQuery = { limit: 10, page: 1, sort: 'name' };
    const repository = {
      findById: vi.fn(),
      list: vi.fn().mockResolvedValue({ data: [createAlbumDetailRecord()], total: 1 }),
    } as unknown as AlbumsRepository;
    const service = new AlbumsService(repository);

    await expect(service.list(query)).resolves.toEqual({
      data: [
        {
          id: 2,
          imageUrl: 'https://example.com/album.jpg',
          name: 'Album',
          primaryArtist: {
            id: 1,
            imageUrl: null,
            name: 'Artist',
            spotifyUri: 'spotify:artist:1',
          },
          spotifyUri: 'spotify:album:2',
        },
      ],
      limit: 10,
      page: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('maps album details', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(createAlbumDetailRecord()),
      list: vi.fn(),
    } as unknown as AlbumsRepository;
    const service = new AlbumsService(repository);

    await expect(service.getById(2)).resolves.toEqual({
      createdAt: '2026-01-01T00:00:00.000Z',
      id: 2,
      imageUrl: 'https://example.com/album.jpg',
      name: 'Album',
      primaryArtist: {
        id: 1,
        imageUrl: null,
        name: 'Artist',
        spotifyUri: 'spotify:artist:1',
      },
      spotifyUri: 'spotify:album:2',
      trackCount: 12,
    });
  });

  it('throws when an album does not exist', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(null),
      list: vi.fn(),
    } as unknown as AlbumsRepository;
    const service = new AlbumsService(repository);

    await expect(service.getById(404)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });
});

function createAlbumDetailRecord(): AlbumDetailRecord {
  const primaryArtist = {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 1,
    imageUrl: null,
    name: 'Artist',
    normalizedName: 'artist',
    spotifyUri: 'spotify:artist:1',
    hiddenAt: null,
  };

  return {
    _count: {
      tracks: 12,
    },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 2,
    imageUrl: 'https://example.com/album.jpg',
    name: 'Album',
    primaryArtist,
    primaryArtistId: primaryArtist.id,
    spotifyUri: 'spotify:album:2',
    hiddenAt: null,
  };
}
