import { ErrorCode } from '@statify/shared';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  it('allows handlers without role requirements', () => {
    const guard = new RolesGuard(createReflector(undefined));

    expect(guard.canActivate(createContext({} as Request))).toBe(true);
  });

  it('allows matching user roles', () => {
    const guard = new RolesGuard(createReflector(['admin']));

    expect(
      guard.canActivate(
        createContext({
          user: { role: 'admin' },
        } as Request & { user: { role: 'admin' } }),
      ),
    ).toBe(true);
  });

  it('rejects missing users and forbidden roles', () => {
    const guard = new RolesGuard(createReflector(['admin']));

    expect(() => guard.canActivate(createContext({} as Request))).toThrow(
      expect.objectContaining({ code: ErrorCode.UNAUTHENTICATED }),
    );
    expect(() =>
      guard.canActivate(
        createContext({
          user: { role: 'user' },
        } as Request & { user: { role: 'user' } }),
      ),
    ).toThrow(expect.objectContaining({ code: ErrorCode.FORBIDDEN }));
  });
});

function createReflector(roles: string[] | undefined): Reflector {
  return {
    getAllAndOverride: vi.fn().mockReturnValue(roles),
  } as unknown as Reflector;
}

function createContext(request: Request): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}
