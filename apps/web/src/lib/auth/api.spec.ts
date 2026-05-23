import { afterEach, describe, expect, it, vi } from 'vitest';
import { changePassword, deleteAccount, logoutUser } from './api';

describe('auth api client', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    if (typeof document !== 'undefined') {
      document.cookie = 'sf_csrf=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    }
  });

  it('sends the CSRF token from the cookie on logout', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.local');
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('document', { cookie: 'sf_csrf=token-xyz; another=value' });

    await logoutUser();

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit & { headers: Headers }];

    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(init.headers.get('x-csrf-token')).toBe('token-xyz');
  });

  it('omits the CSRF header when no cookie is present', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('document', { cookie: '' });

    await changePassword({ currentPassword: 'a', newPassword: 'abcdefgh' });

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit & { headers: Headers }];

    expect(init.headers.has('x-csrf-token')).toBe(false);
    expect(init.headers.get('content-type')).toBe('application/json');
  });

  it('sends DELETE with the CSRF token when deleting the account', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('document', { cookie: 'sf_csrf=delete-token' });

    await deleteAccount({ currentPassword: 'pw' });

    const [input, init] = fetchMock.mock.calls[0] as [URL, RequestInit & { headers: Headers }];

    expect(input.toString().endsWith('/api/v1/auth/account')).toBe(true);
    expect(init.method).toBe('DELETE');
    expect(init.headers.get('x-csrf-token')).toBe('delete-token');
    expect(init.body).toBe(JSON.stringify({ currentPassword: 'pw' }));
  });
});
