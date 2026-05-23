import type { Request } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';
import type { AuthenticatedUser } from '../auth/auth.types';
import { HistoryController } from './history.controller';
import type { ListeningHistoryService } from './listening-history.service';

const USER: AuthenticatedUser = {
  id: 7,
  email: 'user@example.com',
  displayName: 'User',
  role: 'user',
};

describe('HistoryController', () => {
  it('passes the request body and authenticated user through to the service', async () => {
    const recordResult = {
      entry: {
        id: 1,
        trackId: 10,
        playedAt: '2026-05-23T10:00:00.000Z',
        source: 'preview' as const,
        durationPlayedMs: 30_000,
      },
      idempotent: false,
    };
    const service = {
      record: vi.fn().mockResolvedValue(recordResult),
    } as unknown as ListeningHistoryService;
    const controller = new HistoryController(service);

    const result = await controller.record(
      { trackId: 10, source: 'preview', durationPlayedMs: 30_000 },
      USER,
      createRequest({}),
    );

    expect(result).toBe(recordResult);
    expect(service.record).toHaveBeenCalledWith({
      trackId: 10,
      source: 'preview',
      durationPlayedMs: 30_000,
      userId: 7,
      idempotencyKey: undefined,
    });
  });

  it('forwards a valid idempotency key from the request header', async () => {
    const service = {
      record: vi.fn().mockResolvedValue({ entry: {}, idempotent: true }),
    } as unknown as ListeningHistoryService;
    const controller = new HistoryController(service);

    await controller.record(
      { trackId: 10, source: 'preview', durationPlayedMs: 1000 },
      USER,
      createRequest({ 'idempotency-key': 'abc_123-XYZ' }),
    );

    expect(service.record).toHaveBeenCalledWith(
      expect.objectContaining({ idempotencyKey: 'abc_123-XYZ' }),
    );
  });

  it('rejects an idempotency key with disallowed characters', () => {
    const service = { record: vi.fn() } as unknown as ListeningHistoryService;
    const controller = new HistoryController(service);

    expect(() =>
      controller.record(
        { trackId: 10, source: 'preview', durationPlayedMs: 1000 },
        USER,
        createRequest({ 'idempotency-key': 'bad key with spaces' }),
      ),
    ).toThrow(ZodError);
    expect(service.record).not.toHaveBeenCalled();
  });
});

function createRequest(headers: Record<string, string>): Request {
  const lower: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    lower[key.toLowerCase()] = value;
  }

  return {
    get: (name: string) => lower[name.toLowerCase()],
  } as unknown as Request;
}
