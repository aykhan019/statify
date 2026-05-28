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
      maxDurationMs: 240000,
      minDurationMs: 120000,
      page: 2,
      q: 'midnight',
      sort: '-durationMs',
    });

    const where = {
      albumId: 3,
      durationMs: { gte: 120000, lte: 240000 },
      hiddenAt: null,
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

  it('orders by total plays via raw aggregation and restores the SQL order', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ id: 5 }, { id: 2 }]);
    const track = {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn().mockResolvedValue([
        { id: 2, name: 'B' },
        { id: 5, name: 'E' },
      ]),
    };
    const repository = new TracksRepository({
      $queryRaw: queryRaw,
      track,
    } as unknown as PrismaService);

    const result = await repository.list({ limit: 10, page: 1, sort: '-plays' });

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(isPrismaSql(queryRaw.mock.calls[0]?.[0])).toBe(true);
    expect(track.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: [5, 2] } } }),
    );
    // findMany returns [2, 5] but the raw play-count order [5, 2] must be preserved.
    expect(result.data.map((record) => record.id)).toEqual([5, 2]);
    expect(result.total).toBe(2);
  });

  it('orders by name via raw SQL (letters first) and restores the SQL order', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ id: 7 }, { id: 4 }]);
    const track = {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn().mockResolvedValue([
        { id: 4, name: 'D' },
        { id: 7, name: 'G' },
      ]),
    };
    const repository = new TracksRepository({
      $queryRaw: queryRaw,
      track,
    } as unknown as PrismaService);

    const result = await repository.list({ limit: 10, page: 1, sort: 'name' });

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(isPrismaSql(queryRaw.mock.calls[0]?.[0])).toBe(true);
    expect(track.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: [7, 4] } } }),
    );
    expect(result.data.map((record) => record.id)).toEqual([7, 4]);
  });
});

function isPrismaSql(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'strings' in value &&
    'values' in value &&
    'sql' in value
  );
}
