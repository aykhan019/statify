import { Prisma } from '@prisma/client';
import type { PrismaService } from '../../database/prisma.service';
import { describe, expect, it, vi } from 'vitest';
import { SearchRepository } from './search.repository';

function isPrismaSql(value: unknown): value is { sql: string; values: unknown[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sql' in value &&
    'values' in value &&
    typeof (value as { sql?: unknown }).sql === 'string' &&
    Array.isArray((value as { values?: unknown }).values)
  );
}

describe('SearchRepository', () => {
  it('runs trigram-backed searches for tracks, artists, and albums', async () => {
    const calls: Array<{ sql: string; values: unknown[] }> = [];
    const queryRaw = vi.fn((input: unknown) => {
      if (isPrismaSql(input)) {
        calls.push({ sql: input.sql, values: input.values });
      }

      return Promise.resolve([]);
    });
    const repository = new SearchRepository({
      $queryRaw: queryRaw,
    } as unknown as PrismaService);

    await repository.search({ limit: 4, q: 'midnight' });

    expect(queryRaw).toHaveBeenCalledTimes(3);
    expect(calls[0]?.sql).toContain('similarity(t.name');
    expect(calls[1]?.sql).toContain('similarity(a.name');
    expect(calls[2]?.sql).toContain('similarity(al.name');
    expect(calls[0]?.values).toContain('midnight');
    expect(calls[0]?.values).toContain('%midnight%');
    expect(calls[0]?.values).toContain(4);
  });

  it('keeps Prisma SQL inputs recognizable in tests', () => {
    expect(isPrismaSql(Prisma.sql`SELECT 1`)).toBe(true);
  });
});
