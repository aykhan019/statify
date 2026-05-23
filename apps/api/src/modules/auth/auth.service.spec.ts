import { ErrorCode } from '@statify/shared';
import type { User } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditLogService } from '../admin/audit-log.service';
import type { AuthRepository, RefreshTokenWithUser } from './auth.repository';
import { AuthService } from './auth.service';
import type { AuthTokenService } from './auth-token.service';
import type { AuthTokenSet } from './auth.types';
import type { PasswordService } from './password.service';

describe('AuthService', () => {
  let repository: MockAuthRepository;
  let passwordService: MockPasswordService;
  let tokenService: MockAuthTokenService;
  let auditLog: MockAuditLogService;
  let service: AuthService;

  beforeEach(() => {
    repository = createRepository();
    passwordService = {
      hash: vi.fn().mockResolvedValue('password-hash'),
      verify: vi.fn().mockResolvedValue(true),
    };
    tokenService = {
      createTokenSet: vi.fn().mockResolvedValue(createTokens()),
      hashRefreshToken: vi.fn().mockReturnValue('refresh-hash'),
      verifyRefreshToken: vi.fn().mockResolvedValue({ sub: 1 }),
    };
    auditLog = { record: vi.fn().mockResolvedValue(undefined) };
    service = new AuthService(
      repository as unknown as AuthRepository,
      passwordService as unknown as PasswordService,
      tokenService as unknown as AuthTokenService,
      auditLog as unknown as AuditLogService,
    );
  });

  it('registers a new user and persists a refresh token', async () => {
    repository.findUserByEmail.mockResolvedValue(null);
    repository.createUser.mockResolvedValue(createUser());

    const session = await service.register(
      {
        email: 'user@example.com',
        password: 'password123',
        displayName: 'User',
      },
      { userAgent: 'test-agent', ipAddr: '127.0.0.1' },
    );

    expect(passwordService.hash).toHaveBeenCalledWith('password123');
    expect(repository.createUser).toHaveBeenCalledWith({
      email: 'user@example.com',
      displayName: 'User',
      passwordHash: 'password-hash',
    });
    expect(repository.createRefreshToken).toHaveBeenCalledWith(1, createTokens(), {
      userAgent: 'test-agent',
      ipAddr: '127.0.0.1',
    });
    expect(session.user.email).toBe('user@example.com');
  });

  it('rejects duplicate registrations', async () => {
    repository.findUserByEmail.mockResolvedValue(createUser());

    await expect(
      service.register(
        {
          email: 'user@example.com',
          password: 'password123',
          displayName: 'User',
        },
        {},
      ),
    ).rejects.toMatchObject({ code: ErrorCode.EMAIL_TAKEN });
  });

  it('rejects invalid login credentials', async () => {
    repository.findUserByEmail.mockResolvedValue(createUser());
    passwordService.verify.mockResolvedValue(false);

    await expect(
      service.login({ email: 'user@example.com', password: 'wrong' }, {}),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS });
  });

  it('rotates a valid refresh token', async () => {
    repository.findRefreshTokenByHash.mockResolvedValue(createStoredRefreshToken());

    const session = await service.refresh('refresh-token', {});

    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(repository.rotateRefreshToken).toHaveBeenCalledWith(10, 1, createTokens(), {});
    expect(session.tokens.refreshToken).toBe('refresh');
  });

  it('rejects missing refresh tokens', async () => {
    await expect(service.refresh(undefined, {})).rejects.toMatchObject({
      code: ErrorCode.TOKEN_INVALID,
    });
  });

  it('logs out a session by revoking the refresh token and writing an audit entry', async () => {
    await service.logout('refresh-token', 7);

    expect(tokenService.hashRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(repository.revokeRefreshTokenByHash).toHaveBeenCalledWith('refresh-hash');
    expect(auditLog.record).toHaveBeenCalledWith({
      actorUserId: 7,
      action: 'auth.logout',
      targetTable: 'users',
      targetId: '7',
      metadata: null,
    });
  });

  it('still records an audit entry when logout has no refresh cookie', async () => {
    await service.logout(undefined, 7);

    expect(repository.revokeRefreshTokenByHash).not.toHaveBeenCalled();
    expect(auditLog.record).toHaveBeenCalled();
  });

  it('changes password when the current one matches and revokes refresh tokens', async () => {
    repository.findUserById.mockResolvedValue(createUser());
    passwordService.verify.mockResolvedValue(true);

    await service.changePassword(1, {
      currentPassword: 'current',
      newPassword: 'updated123',
    });

    expect(passwordService.verify).toHaveBeenCalledWith('password-hash', 'current');
    expect(passwordService.hash).toHaveBeenCalledWith('updated123');
    expect(repository.updatePasswordHash).toHaveBeenCalledWith(1, 'password-hash');
    expect(auditLog.record).toHaveBeenCalledWith({
      actorUserId: 1,
      action: 'auth.password_change',
      targetTable: 'users',
      targetId: '1',
      metadata: null,
    });
  });

  it('rejects password change when the current password is wrong', async () => {
    repository.findUserById.mockResolvedValue(createUser());
    passwordService.verify.mockResolvedValue(false);

    await expect(
      service.changePassword(1, { currentPassword: 'wrong', newPassword: 'updated123' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS });

    expect(repository.updatePasswordHash).not.toHaveBeenCalled();
  });

  it('soft-deletes the account when the password matches', async () => {
    repository.findUserById.mockResolvedValue(createUser());
    passwordService.verify.mockResolvedValue(true);

    await service.deleteAccount(1, 'current');

    expect(repository.softDeleteUser).toHaveBeenCalledWith(1);
    expect(auditLog.record).toHaveBeenCalledWith({
      actorUserId: 1,
      action: 'auth.account_deleted',
      targetTable: 'users',
      targetId: '1',
      metadata: null,
    });
  });

  it('rejects account deletion when the password is wrong', async () => {
    repository.findUserById.mockResolvedValue(createUser());
    passwordService.verify.mockResolvedValue(false);

    await expect(service.deleteAccount(1, 'wrong')).rejects.toMatchObject({
      code: ErrorCode.INVALID_CREDENTIALS,
    });

    expect(repository.softDeleteUser).not.toHaveBeenCalled();
  });
});

type MockAuthRepository = {
  [K in keyof Pick<
    AuthRepository,
    | 'findUserByEmail'
    | 'findUserById'
    | 'createUser'
    | 'updateLastLoginAt'
    | 'createRefreshToken'
    | 'findRefreshTokenByHash'
    | 'rotateRefreshToken'
    | 'updatePasswordHash'
    | 'softDeleteUser'
    | 'revokeRefreshTokenByHash'
  >]: ReturnType<typeof vi.fn>;
};

type MockAuditLogService = { record: ReturnType<typeof vi.fn> };

type MockPasswordService = {
  hash: ReturnType<typeof vi.fn>;
  verify: ReturnType<typeof vi.fn>;
};

type MockAuthTokenService = {
  createTokenSet: ReturnType<typeof vi.fn>;
  hashRefreshToken: ReturnType<typeof vi.fn>;
  verifyRefreshToken: ReturnType<typeof vi.fn>;
};

function createRepository(): MockAuthRepository {
  return {
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    createUser: vi.fn(),
    updateLastLoginAt: vi.fn().mockResolvedValue(createUser()),
    createRefreshToken: vi.fn().mockResolvedValue({}),
    findRefreshTokenByHash: vi.fn(),
    rotateRefreshToken: vi.fn().mockResolvedValue(undefined),
    updatePasswordHash: vi.fn().mockResolvedValue(undefined),
    softDeleteUser: vi.fn().mockResolvedValue(undefined),
    revokeRefreshTokenByHash: vi.fn().mockResolvedValue(1),
  };
}

function createUser(): User {
  return {
    id: 1,
    email: 'user@example.com',
    passwordHash: 'password-hash',
    displayName: 'User',
    role: 'user',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    lastLoginAt: null,
    deletedAt: null,
    bannedAt: null,
  };
}

function createTokens(): AuthTokenSet {
  return {
    accessToken: 'access',
    refreshToken: 'refresh',
    refreshTokenHash: 'refresh-hash',
    refreshTokenExpiresAt: new Date('2026-02-01T00:00:00.000Z'),
    csrfToken: 'csrf',
  };
}

function createStoredRefreshToken(): RefreshTokenWithUser {
  return {
    id: 10,
    userId: 1,
    tokenHash: 'refresh-hash',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    userAgent: null,
    ipAddr: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    user: createUser(),
  };
}
