import { Injectable } from '@nestjs/common';
import type { AuditLog } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { AuditLogListQuery, AuditLogWriteInput } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from '../catalog/catalog.pagination';

export interface AuditLogListResult {
  data: AuditLog[];
  total: number;
}

@Injectable()
export class AuditLogRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(input: AuditLogWriteInput): Promise<AuditLog> {
    return this.client.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        targetTable: input.targetTable,
        targetId: input.targetId,
        metadata:
          input.metadata === null ? Prisma.JsonNull : (input.metadata as Prisma.InputJsonValue),
      },
    });
  }

  async list(query: AuditLogListQuery): Promise<AuditLogListResult> {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.action !== undefined) {
      where.action = query.action;
    }
    if (query.actorUserId !== undefined) {
      where.actorUserId = query.actorUserId;
    }
    if (query.targetTable !== undefined) {
      where.targetTable = query.targetTable;
    }
    if (query.targetId !== undefined) {
      where.targetId = query.targetId;
    }

    const [data, total] = await Promise.all([
      this.client.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: getOffset(query),
        take: query.limit,
      }),
      this.client.auditLog.count({ where }),
    ]);

    return { data, total };
  }
}
