import { describe, expect, it } from 'vitest';
import { isAdmin } from './admin';

const ADMIN = {
  id: 1,
  email: 'admin@example.com',
  displayName: 'Admin',
  role: 'admin' as const,
};

const USER = {
  id: 2,
  email: 'user@example.com',
  displayName: 'User',
  role: 'user' as const,
};

describe('isAdmin', () => {
  it('returns true for users with the admin role', () => {
    expect(isAdmin(ADMIN)).toBe(true);
  });

  it('returns false for users with the user role', () => {
    expect(isAdmin(USER)).toBe(false);
  });

  it('returns false for null or undefined', () => {
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
