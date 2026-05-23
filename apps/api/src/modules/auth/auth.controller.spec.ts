import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import type { AuthCookieService } from './auth-cookie.service';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';
import type { RequestWithUser } from './auth.types';

describe('AuthController', () => {
  it('returns the current authenticated user', () => {
    const controller = new AuthController({} as AuthService, {} as AuthCookieService);
    const user = {
      id: 1,
      email: 'user@example.com',
      displayName: 'User',
      role: 'user' as const,
    };

    expect(controller.me({ user } as Request & RequestWithUser)).toEqual({ user });
  });
});
