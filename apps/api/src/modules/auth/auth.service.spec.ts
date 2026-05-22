import { ErrorCode } from '@statify/shared';
import type { User } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthRepository, RefreshTokenWithUser } from './auth.repository';
import { AuthService } from './auth.service';
import type { AuthTokenService } from './auth-token.service';
import type { AuthTokenSet } from './auth.types';
import type { PasswordService } from './password.service';

describe('AuthService', () => {
  let repository: MockAuthRepository;
  let passwordService: MockPasswordService;
  let tokenService: MockAuthTokenService;
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
    service = new AuthService(
      repository as unknown as AuthRepository,
      passwordService as unknown as PasswordService,
      tokenService as unknown as AuthTokenService,
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
});

type MockAuthRepository = {
  [K in keyof Pick<
    AuthRepository,
    | 'findUserByEmail'
    | 'createUser'
    | 'updateLastLoginAt'
    | 'createRefreshToken'
    | 'findRefreshTokenByHash'
    | 'rotateRefreshToken'
  >]: ReturnType<typeof vi.fn>;
};

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
    createUser: vi.fn(),
    updateLastLoginAt: vi.fn().mockResolvedValue(createUser()),
    createRefreshToken: vi.fn().mockResolvedValue({}),
    findRefreshTokenByHash: vi.fn(),
    rotateRefreshToken: vi.fn().mockResolvedValue(undefined),
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
