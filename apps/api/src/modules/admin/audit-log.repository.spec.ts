import { Prisma } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../database/prisma.service';
import { AuditLogRepository } from './audit-log.repository';

describe('AuditLogRepository', () => {
  it('persists the audit row with the supplied metadata', async () => {
    const create = vi.fn().mockResolvedValue({});
    const repository = new AuditLogRepository({
      auditLog: { create },
    } as unknown as PrismaService);

    await repository.create({
      actorUserId: 7,
      action: 'user.ban',
      targetTable: 'users',
      targetId: '42',
      metadata: { reason: 'spam' },
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: 7,
        action: 'user.ban',
        targetTable: 'users',
        targetId: '42',
        metadata: { reason: 'spam' },
      },
    });
  });

  it('writes Prisma.JsonNull when metadata is null', async () => {
    const create = vi.fn().mockResolvedValue({});
    const repository = new AuditLogRepository({
      auditLog: { create },
    } as unknown as PrismaService);

    await repository.create({
      actorUserId: null,
      action: 'system.boot',
      targetTable: 'system',
      targetId: null,
      metadata: null,
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ metadata: Prisma.JsonNull }),
    });
  });
});
