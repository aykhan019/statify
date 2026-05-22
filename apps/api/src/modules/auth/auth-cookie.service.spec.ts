import { COOKIE_NAMES } from '@statify/shared';
import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '../../config/config.service';
import { AuthCookieService } from './auth-cookie.service';
import type { AuthTokenSet } from './auth.types';

describe('AuthCookieService', () => {
  it('sets httpOnly auth cookies and a readable csrf cookie', () => {
    const response = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as Response;
    const service = new AuthCookieService(createConfig());
    const tokens: AuthTokenSet = {
      accessToken: 'access',
      refreshToken: 'refresh',
      refreshTokenHash: 'hash',
      refreshTokenExpiresAt: new Date(),
      csrfToken: 'csrf',
    };

    service.setAuthCookies(response, tokens);

    expect(response.cookie).toHaveBeenCalledWith(
      COOKIE_NAMES.ACCESS,
      'access',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      COOKIE_NAMES.REFRESH,
      'refresh',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      COOKIE_NAMES.CSRF,
      'csrf',
      expect.objectContaining({ httpOnly: false, sameSite: 'lax' }),
    );
  });
});

function createConfig(): ConfigService {
  return {
    cookieSecure: false,
    cookieDomain: 'localhost',
    jwtAccessTtl: '15m',
    jwtRefreshTtl: '30d',
  } as ConfigService;
}
