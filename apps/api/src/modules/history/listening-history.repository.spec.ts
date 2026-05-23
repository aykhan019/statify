import type { ListeningHistory, Track } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../database/prisma.service';
import { ListeningHistoryRepository } from './listening-history.repository';

const BASE_INPUT = {
  userId: 1,
  trackId: 10,
  source: 'preview' as const,
  durationPlayedMs: 30_000,
};

describe('ListeningHistoryRepository', () => {
  it('creates a new entry without an idempotency key', async () => {
    const created = createListeningHistory({ idempotencyKey: null });
    const listeningHistory = {
      create: vi.fn().mockResolvedValue(created),
      findUnique: vi.fn(),
    };
    const repository = new ListeningHistoryRepository({
      listeningHistory,
    } as unknown as PrismaService);

    const result = await repository.record(BASE_INPUT);

    expect(result).toEqual({ entry: created, created: true });
    expect(listeningHistory.findUnique).not.toHaveBeenCalled();
    expect(listeningHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 1,
        trackId: 10,
        source: 'preview',
        durationPlayedMs: 30_000,
        idempotencyKey: null,
      }),
    });
  });

  it('returns the existing entry when the idempotency key already exists', async () => {
    const existing = createListeningHistory({ idempotencyKey: 'abc-123' });
    const listeningHistory = {
      create: vi.fn(),
      findUnique: vi.fn().mockResolvedValue(existing),
    };
    const repository = new ListeningHistoryRepository({
      listeningHistory,
    } as unknown as PrismaService);

    const result = await repository.record({ ...BASE_INPUT, idempotencyKey: 'abc-123' });

    expect(result).toEqual({ entry: existing, created: false });
    expect(listeningHistory.findUnique).toHaveBeenCalledWith({
      where: { userId_idempotencyKey: { userId: 1, idempotencyKey: 'abc-123' } },
    });
    expect(listeningHistory.create).not.toHaveBeenCalled();
  });

  it('returns the raced entry when a concurrent insert wins the unique constraint', async () => {
    const raced = createListeningHistory({ idempotencyKey: 'race-1' });
    const conflict = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });
    const findUnique = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(raced);
    const listeningHistory = {
      create: vi.fn().mockRejectedValue(conflict),
      findUnique,
    };
    const repository = new ListeningHistoryRepository({
      listeningHistory,
    } as unknown as PrismaService);

    const result = await repository.record({ ...BASE_INPUT, idempotencyKey: 'race-1' });

    expect(result).toEqual({ entry: raced, created: false });
    expect(findUnique).toHaveBeenCalledTimes(2);
    expect(listeningHistory.create).toHaveBeenCalledTimes(1);
  });

  it('rethrows non-conflict errors', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const error = new Error('database down');
    const listeningHistory = {
      create: vi.fn().mockRejectedValue(error),
      findUnique,
    };
    const repository = new ListeningHistoryRepository({
      listeningHistory,
    } as unknown as PrismaService);

    await expect(repository.record({ ...BASE_INPUT, idempotencyKey: 'oops' })).rejects.toBe(error);
  });

  it('uses the provided playedAt when present', async () => {
    const created = createListeningHistory({});
    const listeningHistory = {
      create: vi.fn().mockResolvedValue(created),
      findUnique: vi.fn(),
    };
    const repository = new ListeningHistoryRepository({
      listeningHistory,
    } as unknown as PrismaService);

    await repository.record({ ...BASE_INPUT, playedAt: '2026-05-23T10:00:00.000Z' });

    expect(listeningHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ playedAt: new Date('2026-05-23T10:00:00.000Z') }),
    });
  });

  it('looks up tracks by id', async () => {
    const track = { id: 7 } as Track;
    const trackTable = { findUnique: vi.fn().mockResolvedValue(track) };
    const repository = new ListeningHistoryRepository({
      track: trackTable,
    } as unknown as PrismaService);

    await expect(repository.findTrackById(7)).resolves.toBe(track);
    expect(trackTable.findUnique).toHaveBeenCalledWith({ where: { id: 7 } });
  });
});

function createListeningHistory(overrides: Partial<ListeningHistory>): ListeningHistory {
  return {
    id: 1,
    userId: 1,
    trackId: 10,
    playedAt: new Date('2026-05-23T00:00:00.000Z'),
    source: 'preview',
    durationPlayedMs: 30_000,
    idempotencyKey: null,
    ...overrides,
  };
}
