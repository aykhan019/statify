import type { AuthUser } from '@statify/shared';

export function isAdmin(user: AuthUser | null | undefined): boolean {
  return user !== null && user !== undefined && user.role === 'admin';
}
