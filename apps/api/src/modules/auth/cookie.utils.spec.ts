import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import { getCookie, parseCookieHeader } from './cookie.utils';

describe('cookie utils', () => {
  it('parses cookie headers', () => {
    expect(parseCookieHeader('sf_access=one; sf_csrf=token%201')).toEqual({
      sf_access: 'one',
      sf_csrf: 'token 1',
    });
  });

  it('returns a named cookie from a request', () => {
    const request = {
      headers: { cookie: 'sf_refresh=refresh-token' },
    } as Request;

    expect(getCookie(request, 'sf_refresh')).toBe('refresh-token');
  });
});
