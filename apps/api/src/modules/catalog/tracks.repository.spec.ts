import type { PrismaService } from '../../database/prisma.service';
import { describe, expect, it, vi } from 'vitest';
import { TracksRepository } from './tracks.repository';

describe('TracksRepository', () => {
  it('applies filters, sorting, and offset pagination', async () => {
    const track = {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn().mockResolvedValue([]),
    };
    const repository = new TracksRepository({ track } as unknown as PrismaService);

    await repository.list({
      albumId: 3,
      artistId: 4,
      hasPreview: true,
      limit: 10,
      page: 2,
      q: 'midnight',
      sort: '-durationMs',
    });

    const where = {
      albumId: 3,
      name: { contains: 'midnight', mode: 'insensitive' },
      previewUrl: { not: null },
      trackArtists: { some: { artistId: 4 } },
    };

    expect(track.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ durationMs: 'desc' }, { id: 'asc' }],
        skip: 10,
        take: 10,
        where,
      }),
    );
    expect(track.count).toHaveBeenCalledWith({ where });
  });
});
