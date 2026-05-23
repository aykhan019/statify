import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSessionFromCookieHeader } from './session';

describe('getSessionFromCookieHeader', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns null without a cookie header', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(getSessionFromCookieHeader('')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns the current user from the API session endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          user: {
            id: 1,
            email: 'user@example.com',
            displayName: 'User',
            role: 'user',
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.local');
    vi.stubGlobal('fetch', fetchMock);

    await expect(getSessionFromCookieHeader('sf_access=token')).resolves.toEqual({
      id: 1,
      email: 'user@example.com',
      displayName: 'User',
      role: 'user',
    });

    const [input, init] = fetchMock.mock.calls[0] as [URL, RequestInit & { headers: Headers }];

    expect(input.toString()).toBe('http://api.local/api/v1/auth/me');
    expect(init.cache).toBe('no-store');
    expect(init.headers.get('cookie')).toBe('sf_access=token');
  });

  it('returns null when the API rejects the access cookie', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Authentication required' } }), {
        status: 401,
        statusText: 'Unauthorized',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(getSessionFromCookieHeader('sf_access=expired')).resolves.toBeNull();
  });
});
