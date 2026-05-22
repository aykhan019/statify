import type { User } from '@prisma/client';
import type { AuthUser } from '@statify/shared';

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}
