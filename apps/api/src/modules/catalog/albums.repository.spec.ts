import type { PrismaService } from '../../database/prisma.service';
import { describe, expect, it, vi } from 'vitest';
import { AlbumsRepository } from './albums.repository';

describe('AlbumsRepository', () => {
  it('applies artist search, sorting, and offset pagination', async () => {
    const album = {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
    };
    const repository = new AlbumsRepository({ album } as unknown as PrismaService);

    await repository.list({
      artistId: 9,
      limit: 5,
      page: 4,
      q: 'blue',
      sort: 'name',
    });

    const where = {
      name: { contains: 'blue', mode: 'insensitive' },
      primaryArtistId: 9,
    };

    expect(album.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip: 15,
        take: 5,
        where,
      }),
    );
    expect(album.count).toHaveBeenCalledWith({ where });
  });
});
