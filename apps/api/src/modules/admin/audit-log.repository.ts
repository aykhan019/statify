import { Injectable } from '@nestjs/common';
import type { AuditLog } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { AuditLogWriteInput } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';

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
}
