import type { PrismaService } from '../../database/prisma.service';
import { describe, expect, it, vi } from 'vitest';
import { AlbumsRepository } from './albums.repository';

describe('AlbumsRepository', () => {
  it('applies artist search, sorting, and offset pagination on the Prisma path', async () => {
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
      sort: '-createdAt',
    });

    const where = {
      name: { contains: 'blue', mode: 'insensitive' },
      primaryArtistId: 9,
    };

    expect(album.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip: 15,
        take: 5,
        where,
      }),
    );
    expect(album.count).toHaveBeenCalledWith({ where });
  });

  it('orders by name via raw SQL (letters first) and restores the SQL order', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ id: 2 }, { id: 1 }]);
    const album = {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn().mockResolvedValue([
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
      ]),
    };
    const repository = new AlbumsRepository({
      $queryRaw: queryRaw,
      album,
    } as unknown as PrismaService);

    const result = await repository.list({ limit: 5, page: 1, sort: 'name' });

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(isPrismaSql(queryRaw.mock.calls[0]?.[0])).toBe(true);
    expect(album.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: [2, 1] } } }),
    );
    expect(result.data.map((record) => record.id)).toEqual([2, 1]);
  });

  it('orders by total plays via raw aggregation and restores the SQL order', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ id: 3 }, { id: 1 }]);
    const album = {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn().mockResolvedValue([
        { id: 1, name: 'A' },
        { id: 3, name: 'C' },
      ]),
    };
    const repository = new AlbumsRepository({
      $queryRaw: queryRaw,
      album,
    } as unknown as PrismaService);

    const result = await repository.list({ limit: 5, page: 1, sort: '-plays' });

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(isPrismaSql(queryRaw.mock.calls[0]?.[0])).toBe(true);
    expect(album.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: [3, 1] } } }),
    );
    // findMany returns [1, 3] but the raw play-count order [3, 1] must be preserved.
    expect(result.data.map((record) => record.id)).toEqual([3, 1]);
    expect(result.total).toBe(2);
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
