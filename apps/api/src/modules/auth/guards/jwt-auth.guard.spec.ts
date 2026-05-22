import { ErrorCode } from '@statify/shared';
import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { AuthTokenService } from '../auth-token.service';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('attaches the authenticated user from a valid access token', async () => {
    const tokenService = {
      verifyAccessToken: vi.fn().mockResolvedValue({
        sub: 1,
        email: 'user@example.com',
        role: 'admin',
      }),
    } as unknown as AuthTokenService;
    const guard = new JwtAuthGuard(tokenService);
    const request = {
      headers: { cookie: 'sf_access=access-token' },
    } as Request & { user?: unknown };

    await expect(guard.canActivate(createContext(request))).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 1,
      email: 'user@example.com',
      displayName: '',
      role: 'admin',
    });
  });

  it('rejects requests without an access token', async () => {
    const guard = new JwtAuthGuard({
      verifyAccessToken: vi.fn(),
    } as unknown as AuthTokenService);

    await expect(
      guard.canActivate(createContext({ headers: {} } as Request)),
    ).rejects.toMatchObject({
      code: ErrorCode.UNAUTHENTICATED,
    });
  });
});

function createContext(request: Request): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}
