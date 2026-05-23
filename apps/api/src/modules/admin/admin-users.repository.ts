import { Injectable } from '@nestjs/common';
import type { Prisma, User, UserRole } from '@prisma/client';
import type { AdminUsersListQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from '../catalog/catalog.pagination';

export interface AdminUserListResult {
  data: User[];
  total: number;
}

@Injectable()
export class AdminUsersRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super(prisma);
  }

  async list(query: AdminUsersListQuery): Promise<AdminUserListResult> {
    const where: Prisma.UserWhereInput = {};
    if (query.q !== undefined) {
      where.OR = [
        { email: { contains: query.q, mode: 'insensitive' } },
        { displayName: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.client.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: getOffset(query),
        take: query.limit,
      }),
      this.client.user.count({ where }),
    ]);

    return { data, total };
  }

  findById(userId: number): Promise<User | null> {
    return this.client.user.findUnique({ where: { id: userId } });
  }

  setRole(userId: number, role: UserRole): Promise<User> {
    return this.prisma.transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { role },
      });
      await tx.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      return user;
    });
  }

  setBan(userId: number, banned: boolean): Promise<User> {
    return this.prisma.transaction(async (tx) => {
      const bannedAt = banned ? new Date() : null;
      const user = await tx.user.update({
        where: { id: userId },
        data: { bannedAt },
      });
      if (banned) {
        await tx.refreshToken.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      return user;
    });
  }
}
