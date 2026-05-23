import { HttpStatus, Injectable } from '@nestjs/common';
import type { UserRole as PrismaUserRole } from '@prisma/client';
import {
  AppError,
  ErrorCode,
  type AdminUserListResponse,
  type AdminUsersListQuery,
} from '@statify/shared';
import { toOffsetPage } from '../catalog/catalog.pagination';
import { toAdminUserListItem } from './admin-users.mapper';
import { AdminUsersRepository } from './admin-users.repository';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly repository: AdminUsersRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(query: AdminUsersListQuery): Promise<AdminUserListResponse> {
    const result = await this.repository.list(query);
    return toOffsetPage(result.data.map(toAdminUserListItem), result.total, query);
  }

  async setRole(actorId: number, userId: number, role: PrismaUserRole) {
    if (actorId === userId) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        message: 'Admins cannot change their own role',
        httpStatus: HttpStatus.FORBIDDEN,
      });
    }

    const existing = await this.requireUser(userId);
    if (existing.role === role) {
      return toAdminUserListItem(existing);
    }

    const updated = await this.repository.setRole(userId, role);

    await this.auditLog.record({
      actorUserId: actorId,
      action: 'admin.user.role_changed',
      targetTable: 'users',
      targetId: String(userId),
      metadata: { from: existing.role, to: role },
    });

    return toAdminUserListItem(updated);
  }

  async setBan(actorId: number, userId: number, banned: boolean) {
    if (actorId === userId) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        message: 'Admins cannot ban or unban themselves',
        httpStatus: HttpStatus.FORBIDDEN,
      });
    }

    const existing = await this.requireUser(userId);
    const wasBanned = existing.bannedAt !== null;
    if (wasBanned === banned) {
      return toAdminUserListItem(existing);
    }

    const updated = await this.repository.setBan(userId, banned);

    await this.auditLog.record({
      actorUserId: actorId,
      action: banned ? 'admin.user.banned' : 'admin.user.unbanned',
      targetTable: 'users',
      targetId: String(userId),
      metadata: null,
    });

    return toAdminUserListItem(updated);
  }

  private async requireUser(userId: number) {
    const user = await this.repository.findById(userId);
    if (user === null) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: 'User not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }
    return user;
  }
}
