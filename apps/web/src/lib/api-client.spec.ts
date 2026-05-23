import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError, apiFetch } from './api-client';

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('calls the configured API base URL and forwards cookies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
      }),
    );
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.local');
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      apiFetch<{ ok: boolean }>('/api/v1/auth/me', {
        cookieHeader: 'sf_access=token',
      }),
    ).resolves.toEqual({ ok: true });

    const [input, init] = fetchMock.mock.calls[0] as [URL, RequestInit & { headers: Headers }];

    expect(input.toString()).toBe('http://api.local/api/v1/auth/me');
    expect(init.headers.get('cookie')).toBe('sf_access=token');
  });

  it('throws a typed error using the API envelope message', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Authentication required' } }), {
        status: 401,
        statusText: 'Unauthorized',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/api/v1/auth/me')).rejects.toMatchObject({
      message: 'Authentication required',
      status: 401,
    } satisfies Partial<ApiClientError>);
  });
});
