import type { CatalogSearchQuery } from '@statify/shared';
import { describe, expect, it, vi } from 'vitest';
import type { SearchRepository } from './search.repository';
import { SearchService } from './search.service';

describe('SearchService', () => {
  it('maps grouped search rows', async () => {
    const query: CatalogSearchQuery = { limit: 3, q: 'night' };
    const repository = {
      search: vi.fn().mockResolvedValue({
        albums: [
          {
            id: 3,
            image_url: 'https://example.com/album.jpg',
            name: 'Night Album',
            primary_artist_name: 'Album Artist',
            score: 0.4,
          },
        ],
        artists: [
          {
            id: 2,
            image_url: null,
            name: 'Night Artist',
            score: 0.5,
            track_count: 12,
          },
        ],
        tracks: [
          {
            album_name: 'Album',
            id: 1,
            image_url: 'https://example.com/track.jpg',
            name: 'Night Track',
            primary_artist_name: 'Track Artist',
            score: 0.6,
          },
        ],
      }),
    } as unknown as SearchRepository;
    const service = new SearchService(repository);

    await expect(service.search(query)).resolves.toEqual({
      albums: [
        {
          id: 3,
          imageUrl: 'https://example.com/album.jpg',
          name: 'Night Album',
          primaryArtistName: 'Album Artist',
          score: 0.4,
        },
      ],
      artists: [
        {
          id: 2,
          imageUrl: null,
          name: 'Night Artist',
          score: 0.5,
          trackCount: 12,
        },
      ],
      tracks: [
        {
          albumName: 'Album',
          id: 1,
          imageUrl: 'https://example.com/track.jpg',
          name: 'Night Track',
          primaryArtistName: 'Track Artist',
          score: 0.6,
        },
      ],
    });
  });
});
