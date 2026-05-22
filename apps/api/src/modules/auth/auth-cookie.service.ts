import { Injectable } from '@nestjs/common';
import { COOKIE_NAMES } from '@statify/shared';
import type { CookieOptions, Response } from 'express';
import { ConfigService } from '../../config/config.service';
import type { AuthTokenSet } from './auth.types';
import { durationToMs } from './duration';

@Injectable()
export class AuthCookieService {
  constructor(private readonly config: ConfigService) {}

  setAuthCookies(response: Response, tokens: AuthTokenSet): void {
    response.cookie(COOKIE_NAMES.ACCESS, tokens.accessToken, {
      ...this.httpOnlyCookieOptions(),
      maxAge: durationToMs(this.config.jwtAccessTtl),
    });
    response.cookie(COOKIE_NAMES.REFRESH, tokens.refreshToken, {
      ...this.httpOnlyCookieOptions(),
      maxAge: durationToMs(this.config.jwtRefreshTtl),
    });
    response.cookie(COOKIE_NAMES.CSRF, tokens.csrfToken, {
      ...this.baseCookieOptions(),
      httpOnly: false,
      maxAge: durationToMs(this.config.jwtRefreshTtl),
    });
  }

  clearAuthCookies(response: Response): void {
    const options = this.baseCookieOptions();

    response.clearCookie(COOKIE_NAMES.ACCESS, options);
    response.clearCookie(COOKIE_NAMES.REFRESH, options);
    response.clearCookie(COOKIE_NAMES.CSRF, options);
  }

  private httpOnlyCookieOptions(): CookieOptions {
    return {
      ...this.baseCookieOptions(),
      httpOnly: true,
    };
  }

  private baseCookieOptions(): CookieOptions {
    return {
      sameSite: 'lax',
      secure: this.config.cookieSecure,
      path: '/',
      ...(this.config.cookieDomain !== 'localhost' ? { domain: this.config.cookieDomain } : {}),
    };
  }
}
