import { COOKIE_NAMES } from '@statify/shared';
import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { AuthCookieService } from './auth-cookie.service';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';
import type { RequestWithUser } from './auth.types';

const TEST_USER = {
  id: 1,
  email: 'user@example.com',
  displayName: 'User',
  role: 'user' as const,
};

describe('AuthController', () => {
  it('returns the current authenticated user', () => {
    const controller = new AuthController({} as AuthService, {} as AuthCookieService);

    expect(controller.me({ user: TEST_USER } as Request & RequestWithUser)).toEqual({
      user: TEST_USER,
    });
  });

  it('logs out: passes the refresh cookie to the service and clears cookies', async () => {
    const authService = { logout: vi.fn().mockResolvedValue(undefined) };
    const cookieService = { clearAuthCookies: vi.fn() };
    const controller = new AuthController(
      authService as unknown as AuthService,
      cookieService as unknown as AuthCookieService,
    );
    const request = {
      user: TEST_USER,
      headers: { cookie: `${COOKIE_NAMES.REFRESH}=refresh-token` },
    } as unknown as Request & RequestWithUser;
    const response = {} as Response;

    await controller.logout(request, response);

    expect(authService.logout).toHaveBeenCalledWith('refresh-token', TEST_USER.id);
    expect(cookieService.clearAuthCookies).toHaveBeenCalledWith(response);
  });

  it('changes password: delegates to the service and clears cookies', async () => {
    const authService = { changePassword: vi.fn().mockResolvedValue(undefined) };
    const cookieService = { clearAuthCookies: vi.fn() };
    const controller = new AuthController(
      authService as unknown as AuthService,
      cookieService as unknown as AuthCookieService,
    );
    const body = { currentPassword: 'current', newPassword: 'updated123' };

    await controller.changePassword(
      body,
      { user: TEST_USER } as Request & RequestWithUser,
      {} as Response,
    );

    expect(authService.changePassword).toHaveBeenCalledWith(TEST_USER.id, body);
    expect(cookieService.clearAuthCookies).toHaveBeenCalled();
  });

  it('deletes account: delegates to the service and clears cookies', async () => {
    const authService = { deleteAccount: vi.fn().mockResolvedValue(undefined) };
    const cookieService = { clearAuthCookies: vi.fn() };
    const controller = new AuthController(
      authService as unknown as AuthService,
      cookieService as unknown as AuthCookieService,
    );

    await controller.deleteAccount(
      { currentPassword: 'current' },
      { user: TEST_USER } as Request & RequestWithUser,
      {} as Response,
    );

    expect(authService.deleteAccount).toHaveBeenCalledWith(TEST_USER.id, 'current');
    expect(cookieService.clearAuthCookies).toHaveBeenCalled();
  });
});
