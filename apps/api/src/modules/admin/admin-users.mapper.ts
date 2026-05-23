import type { User } from '@prisma/client';
import type { AdminUserListItem } from '@statify/shared';

export function toAdminUserListItem(user: User): AdminUserListItem {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt === null ? null : user.lastLoginAt.toISOString(),
    bannedAt: user.bannedAt === null ? null : user.bannedAt.toISOString(),
    deletedAt: user.deletedAt === null ? null : user.deletedAt.toISOString(),
  };
}
