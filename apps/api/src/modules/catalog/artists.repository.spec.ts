import type { PrismaService } from '../../database/prisma.service';
import { describe, expect, it, vi } from 'vitest';
import { ArtistsRepository } from './artists.repository';

describe('ArtistsRepository', () => {
  it('applies search, sorting, and offset pagination', async () => {
    const artist = {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
    };
    const repository = new ArtistsRepository({ artist } as unknown as PrismaService);

    await repository.list({
      limit: 20,
      page: 3,
      q: 'radio',
      sort: '-createdAt',
    });

    const where = {
      name: { contains: 'radio', mode: 'insensitive' },
    };

    expect(artist.findMany).toHaveBeenCalledWith({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: 40,
      take: 20,
      where,
    });
    expect(artist.count).toHaveBeenCalledWith({ where });
  });
});
