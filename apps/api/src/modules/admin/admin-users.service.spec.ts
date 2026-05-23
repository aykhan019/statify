import type { User } from '@prisma/client';
import { ErrorCode } from '@statify/shared';
import { describe, expect, it, vi } from 'vitest';
import { AdminUsersService } from './admin-users.service';
import type { AdminUsersRepository } from './admin-users.repository';
import type { AuditLogService } from './audit-log.service';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 5,
    email: 'user@example.com',
    passwordHash: 'hash',
    displayName: 'User',
    role: 'user',
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
    lastLoginAt: null,
    deletedAt: null,
    bannedAt: null,
    ...overrides,
  };
}

describe('AdminUsersService', () => {
  it('lists users mapped to API shape', async () => {
    const repository = {
      list: vi.fn().mockResolvedValue({ data: [makeUser()], total: 1 }),
    } as unknown as AdminUsersRepository;
    const auditLog = { record: vi.fn() } as unknown as AuditLogService;
    const service = new AdminUsersService(repository, auditLog);

    const result = await service.list({ page: 1, limit: 20 });

    expect(result.total).toBe(1);
    expect(result.data[0]).toEqual(
      expect.objectContaining({ id: 5, role: 'user', bannedAt: null }),
    );
  });

  it('refuses to change the actor own role', async () => {
    const repository = {
      findById: vi.fn(),
      setRole: vi.fn(),
    } as unknown as AdminUsersRepository;
    const auditLog = { record: vi.fn() } as unknown as AuditLogService;
    const service = new AdminUsersService(repository, auditLog);

    await expect(service.setRole(1, 1, 'user')).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
    expect(repository.setRole).not.toHaveBeenCalled();
  });

  it('writes an audit entry on role change', async () => {
    const existing = makeUser({ id: 7, role: 'user' });
    const updated = makeUser({ id: 7, role: 'admin' });
    const repository = {
      findById: vi.fn().mockResolvedValue(existing),
      setRole: vi.fn().mockResolvedValue(updated),
    } as unknown as AdminUsersRepository;
    const auditLog = { record: vi.fn().mockResolvedValue({}) } as unknown as AuditLogService;
    const service = new AdminUsersService(repository, auditLog);

    const result = await service.setRole(1, 7, 'admin');

    expect(result.role).toBe('admin');
    expect(repository.setRole).toHaveBeenCalledWith(7, 'admin');
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: 1,
        action: 'admin.user.role_changed',
        targetTable: 'users',
        targetId: '7',
        metadata: { from: 'user', to: 'admin' },
      }),
    );
  });

  it('skips persistence and audit when the role is unchanged', async () => {
    const existing = makeUser({ id: 7, role: 'admin' });
    const repository = {
      findById: vi.fn().mockResolvedValue(existing),
      setRole: vi.fn(),
    } as unknown as AdminUsersRepository;
    const auditLog = { record: vi.fn() } as unknown as AuditLogService;
    const service = new AdminUsersService(repository, auditLog);

    const result = await service.setRole(1, 7, 'admin');

    expect(result.role).toBe('admin');
    expect(repository.setRole).not.toHaveBeenCalled();
    expect(auditLog.record).not.toHaveBeenCalled();
  });

  it('refuses to ban the actor themselves', async () => {
    const repository = { findById: vi.fn() } as unknown as AdminUsersRepository;
    const auditLog = { record: vi.fn() } as unknown as AuditLogService;
    const service = new AdminUsersService(repository, auditLog);

    await expect(service.setBan(1, 1, true)).rejects.toMatchObject({
      code: ErrorCode.FORBIDDEN,
    });
  });

  it('writes an audit entry on ban and unban', async () => {
    const existing = makeUser({ id: 9, bannedAt: null });
    const banned = makeUser({ id: 9, bannedAt: new Date('2026-05-24T00:00:00.000Z') });
    const repository = {
      findById: vi.fn().mockResolvedValue(existing),
      setBan: vi.fn().mockResolvedValue(banned),
    } as unknown as AdminUsersRepository;
    const auditLog = { record: vi.fn().mockResolvedValue({}) } as unknown as AuditLogService;
    const service = new AdminUsersService(repository, auditLog);

    const result = await service.setBan(1, 9, true);

    expect(result.bannedAt).toBe('2026-05-24T00:00:00.000Z');
    expect(repository.setBan).toHaveBeenCalledWith(9, true);
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'admin.user.banned' }),
    );
  });

  it('skips persistence when ban state already matches', async () => {
    const existing = makeUser({ id: 9, bannedAt: new Date('2026-05-24T00:00:00.000Z') });
    const repository = {
      findById: vi.fn().mockResolvedValue(existing),
      setBan: vi.fn(),
    } as unknown as AdminUsersRepository;
    const auditLog = { record: vi.fn() } as unknown as AuditLogService;
    const service = new AdminUsersService(repository, auditLog);

    await service.setBan(1, 9, true);

    expect(repository.setBan).not.toHaveBeenCalled();
    expect(auditLog.record).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when the target user does not exist', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(null),
    } as unknown as AdminUsersRepository;
    const auditLog = { record: vi.fn() } as unknown as AuditLogService;
    const service = new AdminUsersService(repository, auditLog);

    await expect(service.setRole(1, 99, 'admin')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });
});
