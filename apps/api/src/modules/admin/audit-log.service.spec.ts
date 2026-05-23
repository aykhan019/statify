import type { AuditLog } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  it('maps the persisted row into a serialized entry', async () => {
    const row: AuditLog = {
      id: 12,
      actorUserId: 5,
      action: 'user.ban',
      targetTable: 'users',
      targetId: '42',
      metadata: { reason: 'spam' },
      createdAt: new Date('2026-05-23T08:00:00.000Z'),
    };
    const repository = {
      create: vi.fn().mockResolvedValue(row),
    } as unknown as AuditLogRepository;
    const service = new AuditLogService(repository);

    await expect(
      service.record({
        actorUserId: 5,
        action: 'user.ban',
        targetTable: 'users',
        targetId: '42',
        metadata: { reason: 'spam' },
      }),
    ).resolves.toEqual({
      id: 12,
      actorUserId: 5,
      action: 'user.ban',
      targetTable: 'users',
      targetId: '42',
      metadata: { reason: 'spam' },
      createdAt: '2026-05-23T08:00:00.000Z',
    });
  });

  it('returns null metadata when the stored JSON is null', async () => {
    const row: AuditLog = {
      id: 1,
      actorUserId: null,
      action: 'system.boot',
      targetTable: 'system',
      targetId: null,
      metadata: null,
      createdAt: new Date('2026-05-23T08:00:00.000Z'),
    };
    const repository = {
      create: vi.fn().mockResolvedValue(row),
    } as unknown as AuditLogRepository;
    const service = new AuditLogService(repository);

    const entry = await service.record({
      actorUserId: null,
      action: 'system.boot',
      targetTable: 'system',
      targetId: null,
      metadata: null,
    });

    expect(entry.metadata).toBeNull();
  });
});
