import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { User, UserRole } from '@prisma/client';
import type { AdminUsersListQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from '../catalog/catalog.pagination';
import { toPositiveInt } from './admin-search.util';

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
    const where = buildWhere(query);
    const asId = query.q === undefined ? null : toPositiveInt(query.q);

    if (asId === null) {
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

    const pattern = `%${query.q}%`;
    const rows = await this.client.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT id
      FROM users
      WHERE id = ${asId}
         OR email ILIKE ${pattern}
         OR display_name ILIKE ${pattern}
      ORDER BY (id = ${asId}) DESC, created_at DESC, id DESC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    const ids = rows.map((row) => row.id);
    const [records, total] = await Promise.all([
      ids.length === 0
        ? Promise.resolve<User[]>([])
        : this.client.user.findMany({ where: { id: { in: ids } } }),
      this.client.user.count({ where }),
    ]);
    const byId = new Map(records.map((record) => [record.id, record]));
    const data = ids
      .map((id) => byId.get(id))
      .filter((record): record is User => record !== undefined);
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

function buildWhere(query: AdminUsersListQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};
  if (query.q !== undefined) {
    const or: Prisma.UserWhereInput[] = [
      { email: { contains: query.q, mode: 'insensitive' } },
      { displayName: { contains: query.q, mode: 'insensitive' } },
    ];
    const asId = toPositiveInt(query.q);
    if (asId !== null) {
      or.push({ id: asId });
    }
    where.OR = or;
  }
  return where;
}
