import type { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { ArtistsRepository } from './artists.repository';

describe('ArtistsRepository', () => {
  it('prioritizes letter and number names for default name sorting', async () => {
    const queryRaw = vi.fn().mockResolvedValue([]);
    const artist = {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn(),
    };
    const repository = new ArtistsRepository({
      $queryRaw: queryRaw,
      artist,
    } as unknown as PrismaService);

    await repository.list({
      limit: 20,
      page: 1,
      sort: 'name',
    });

    expect(artist.findMany).not.toHaveBeenCalled();
    expect(artist.count).toHaveBeenCalledWith({ where: {} });
    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(isPrismaSql(queryRaw.mock.calls[0]?.[0])).toBe(true);
    expect((queryRaw.mock.calls[0]?.[0] as Prisma.Sql | undefined)?.sql).not.toContain(
      'updated_at',
    );
  });

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

  it('orders by total plays via raw aggregation and restores the SQL order', async () => {
    const queryRaw = vi.fn().mockResolvedValue([{ id: 3 }, { id: 1 }]);
    const artist = {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn().mockResolvedValue([
        { id: 1, name: 'A' },
        { id: 3, name: 'C' },
      ]),
    };
    const repository = new ArtistsRepository({
      $queryRaw: queryRaw,
      artist,
    } as unknown as PrismaService);

    const result = await repository.list({ limit: 5, page: 1, sort: '-plays' });

    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(isPrismaSql(queryRaw.mock.calls[0]?.[0])).toBe(true);
    expect(artist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: [3, 1] } } }),
    );
    expect(result.data.map((record) => record.id)).toEqual([3, 1]);
    expect(result.total).toBe(2);
  });
});

function isPrismaSql(value: unknown): value is Prisma.Sql {
  return (
    typeof value === 'object' &&
    value !== null &&
    'strings' in value &&
    'values' in value &&
    'sql' in value
  );
}
