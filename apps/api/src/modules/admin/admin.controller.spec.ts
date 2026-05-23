import { ErrorCode } from '@statify/shared';
import { describe, expect, it } from 'vitest';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AdminController } from './admin.controller';

const ADMIN: AuthenticatedUser = {
  id: 1,
  email: 'admin@example.com',
  displayName: 'Admin',
  role: 'admin',
};

const USER: AuthenticatedUser = {
  id: 2,
  email: 'user@example.com',
  displayName: 'User',
  role: 'user',
};

describe('AdminController', () => {
  it('returns the authenticated admin profile', () => {
    const controller = new AdminController();
    expect(controller.status(ADMIN)).toEqual({
      user: {
        id: 1,
        email: 'admin@example.com',
        displayName: 'Admin',
        role: 'admin',
      },
    });
  });

  it('throws UNAUTHENTICATED when no user is attached', () => {
    const controller = new AdminController();
    expect(() => controller.status(undefined)).toThrowError(
      expect.objectContaining({ code: ErrorCode.UNAUTHENTICATED }),
    );
  });

  it('throws FORBIDDEN for non-admin users even if guards were bypassed', () => {
    const controller = new AdminController();
    expect(() => controller.status(USER)).toThrowError(
      expect.objectContaining({ code: ErrorCode.FORBIDDEN }),
    );
  });
});
