import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchHistory, fetchPlayCount, recordPlay } from './api';

const okResponse = (body: unknown, status = 200) =>
  new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: body === null ? undefined : { 'content-type': 'application/json' },
  });

describe('history api client', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends CSRF and idempotency headers on recordPlay', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        okResponse({
          entry: { id: 1, trackId: 5, playedAt: '', source: 'preview', durationPlayedMs: 0 },
          idempotent: false,
        }),
      );
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.local');
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('document', { cookie: 'sf_csrf=token' });

    await recordPlay(
      { trackId: 5, source: 'preview', durationPlayedMs: 30_000 },
      { idempotencyKey: 'play-5-abc' },
    );

    const [input, init] = fetchMock.mock.calls[0] as [URL, RequestInit & { headers: Headers }];

    expect(input.toString()).toBe('http://api.local/api/v1/me/history');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(init.headers.get('x-csrf-token')).toBe('token');
    expect(init.headers.get('idempotency-key')).toBe('play-5-abc');
  });

  it('forwards cookies on fetchHistory', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(okResponse({ data: [], page: 1, limit: 20, total: 0, totalPages: 0 }));
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.local');
    vi.stubGlobal('fetch', fetchMock);

    await fetchHistory({ page: 2, limit: 50 }, { cookieHeader: 'sf_access=token' });

    const [input, init] = fetchMock.mock.calls[0] as [URL, RequestInit & { headers: Headers }];

    expect(input.toString()).toBe('http://api.local/api/v1/me/history?page=2&limit=50');
    expect(init.headers.get('cookie')).toBe('sf_access=token');
  });

  it('builds the per-track count URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse({ trackId: 9, count: 4 }));
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.local');
    vi.stubGlobal('fetch', fetchMock);

    await fetchPlayCount(9);

    const [input] = fetchMock.mock.calls[0] as [URL];
    expect(input.toString()).toBe('http://api.local/api/v1/me/history/track/9/count');
  });
});
