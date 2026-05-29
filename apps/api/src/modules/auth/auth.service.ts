import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type LoginRequest,
  type PasswordChangeRequest,
  type ProfileUpdateRequest,
  type RegisterRequest,
} from '@statify/shared';
import { AuditLogService } from '../admin/audit-log.service';
import { AuthRepository, type RefreshTokenWithUser } from './auth.repository';
import type { AuthRequestContext, AuthSession } from './auth.types';
import { toAuthUser } from './auth.mapper';
import { AuthTokenService } from './auth-token.service';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: AuthTokenService,
    private readonly auditLog: AuditLogService,
  ) {}

  async register(input: RegisterRequest, context: AuthRequestContext): Promise<AuthSession> {
    const existingUser = await this.repository.findUserByEmail(input.email);
    if (existingUser !== null) {
      throw new AppError({
        code: ErrorCode.EMAIL_TAKEN,
        message: 'Email is already registered',
        httpStatus: HttpStatus.CONFLICT,
      });
    }

    const user = await this.repository.createUser({
      email: input.email,
      displayName: input.displayName,
      passwordHash: await this.passwordService.hash(input.password),
    });

    await this.auditLog.record({
      actorUserId: user.id,
      action: 'auth.register',
      targetTable: 'users',
      targetId: String(user.id),
      metadata: clientMetadata(context),
    });

    return this.issueSession(user, context);
  }

  async login(input: LoginRequest, context: AuthRequestContext): Promise<AuthSession> {
    const user = await this.repository.findUserByEmail(input.email);
    if (user === null) {
      await this.auditLog.record({
        actorUserId: null,
        action: 'auth.login_failed',
        targetTable: 'users',
        targetId: null,
        metadata: { reason: 'unknown_email', email: input.email, ...clientMetadata(context) },
      });
      throw invalidCredentialsError();
    }

    const isValidPassword = await this.passwordService.verify(user.passwordHash, input.password);
    if (!isValidPassword) {
      await this.auditLog.record({
        actorUserId: user.id,
        action: 'auth.login_failed',
        targetTable: 'users',
        targetId: String(user.id),
        metadata: { reason: 'wrong_password', email: input.email, ...clientMetadata(context) },
      });
      throw invalidCredentialsError();
    }

    await this.repository.updateLastLoginAt(user.id);

    await this.auditLog.record({
      actorUserId: user.id,
      action: 'auth.login',
      targetTable: 'users',
      targetId: String(user.id),
      metadata: clientMetadata(context),
    });

    return this.issueSession(user, context);
  }

  async refresh(
    refreshToken: string | undefined,
    context: AuthRequestContext,
  ): Promise<AuthSession> {
    if (refreshToken === undefined) {
      await this.recordRefreshInvalid(null, 'missing_token', context);
      throw tokenInvalidError();
    }

    const payload = await this.verifyRefreshToken(refreshToken).catch(async (error: unknown) => {
      await this.recordRefreshInvalid(null, 'signature_invalid', context);
      throw error;
    });
    const storedToken = await this.repository.findRefreshTokenByHash(
      this.tokenService.hashRefreshToken(refreshToken),
    );

    if (!isUsableRefreshToken(storedToken) || storedToken.userId !== payload.sub) {
      const reason =
        storedToken === null
          ? 'token_not_found'
          : storedToken.revokedAt !== null
            ? 'token_revoked'
            : storedToken.userId !== payload.sub
              ? 'subject_mismatch'
              : 'token_expired';
      await this.recordRefreshInvalid(payload.sub ?? null, reason, context);
      throw tokenInvalidError();
    }

    const user = toAuthUser(storedToken.user);
    const tokens = await this.tokenService.createTokenSet(user);

    await this.repository.rotateRefreshToken(storedToken.id, user.id, tokens, context);

    return { user, tokens };
  }

  async logout(refreshToken: string | undefined, actorUserId: number): Promise<void> {
    if (refreshToken !== undefined && refreshToken.length > 0) {
      const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
      await this.repository.revokeRefreshTokenByHash(tokenHash);
    }

    await this.auditLog.record({
      actorUserId,
      action: 'auth.logout',
      targetTable: 'users',
      targetId: String(actorUserId),
      metadata: null,
    });
  }

  async changePassword(userId: number, input: PasswordChangeRequest): Promise<void> {
    const user = await this.repository.findUserById(userId);
    if (user === null) {
      throw unauthenticatedError();
    }

    const isValid = await this.passwordService.verify(user.passwordHash, input.currentPassword);
    if (!isValid) {
      await this.auditLog.record({
        actorUserId: userId,
        action: 'auth.password_change_failed',
        targetTable: 'users',
        targetId: String(userId),
        metadata: { reason: 'wrong_current_password' },
      });
      throw invalidCredentialsError();
    }

    const newHash = await this.passwordService.hash(input.newPassword);
    await this.repository.updatePasswordHash(userId, newHash);

    await this.auditLog.record({
      actorUserId: userId,
      action: 'auth.password_change',
      targetTable: 'users',
      targetId: String(userId),
      metadata: null,
    });
  }

  async updateProfile(
    userId: number,
    input: ProfileUpdateRequest,
    context: AuthRequestContext,
  ): Promise<AuthSession> {
    const user = await this.repository.findUserById(userId);
    if (user === null) {
      throw unauthenticatedError();
    }

    const isValid = await this.passwordService.verify(user.passwordHash, input.currentPassword);
    if (!isValid) {
      await this.auditLog.record({
        actorUserId: userId,
        action: 'auth.profile_update_failed',
        targetTable: 'users',
        targetId: String(userId),
        metadata: { reason: 'wrong_current_password' },
      });
      throw invalidCredentialsError();
    }

    const emailChanged = input.email !== user.email;
    if (emailChanged) {
      const existing = await this.repository.findUserByEmail(input.email);
      if (existing !== null && existing.id !== userId) {
        throw emailTakenError();
      }
    }

    const updated = await this.repository.updateProfile(userId, {
      displayName: input.displayName,
      email: input.email,
    });

    await this.auditLog.record({
      actorUserId: userId,
      action: 'auth.profile_update',
      targetTable: 'users',
      targetId: String(userId),
      metadata: {
        emailChanged: String(emailChanged),
        displayNameChanged: String(input.displayName !== user.displayName),
      },
    });

    return this.issueSession(updated, context);
  }

  async deleteAccount(userId: number, currentPassword: string): Promise<void> {
    const user = await this.repository.findUserById(userId);
    if (user === null) {
      throw unauthenticatedError();
    }

    const isValid = await this.passwordService.verify(user.passwordHash, currentPassword);
    if (!isValid) {
      await this.auditLog.record({
        actorUserId: userId,
        action: 'auth.account_delete_failed',
        targetTable: 'users',
        targetId: String(userId),
        metadata: { reason: 'wrong_current_password' },
      });
      throw invalidCredentialsError();
    }

    await this.repository.softDeleteUser(userId);

    await this.auditLog.record({
      actorUserId: userId,
      action: 'auth.account_deleted',
      targetTable: 'users',
      targetId: String(userId),
      metadata: null,
    });
  }

  private async recordRefreshInvalid(
    actorUserId: number | null,
    reason: string,
    context: AuthRequestContext,
  ): Promise<void> {
    await this.auditLog.record({
      actorUserId,
      action: 'auth.refresh_invalid',
      targetTable: 'refresh_tokens',
      targetId: actorUserId === null ? null : String(actorUserId),
      metadata: { reason, ...clientMetadata(context) },
    });
  }

  private async issueSession(
    userRecord: Parameters<typeof toAuthUser>[0],
    context: AuthRequestContext,
  ): Promise<AuthSession> {
    const user = toAuthUser(userRecord);
    const tokens = await this.tokenService.createTokenSet(user);

    await this.repository.createRefreshToken(user.id, tokens, context);

    return { user, tokens };
  }

  private async verifyRefreshToken(refreshToken: string) {
    try {
      return await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw tokenInvalidError();
    }
  }
}

function invalidCredentialsError(): AppError {
  return new AppError({
    code: ErrorCode.INVALID_CREDENTIALS,
    message: 'Invalid email or password',
    httpStatus: HttpStatus.UNAUTHORIZED,
  });
}

function emailTakenError(): AppError {
  return new AppError({
    code: ErrorCode.EMAIL_TAKEN,
    message: 'Email is already registered',
    httpStatus: HttpStatus.CONFLICT,
  });
}

function unauthenticatedError(): AppError {
  return new AppError({
    code: ErrorCode.UNAUTHENTICATED,
    message: 'Authentication required',
    httpStatus: HttpStatus.UNAUTHORIZED,
  });
}

function tokenInvalidError(): AppError {
  return new AppError({
    code: ErrorCode.TOKEN_INVALID,
    message: 'Invalid refresh token',
    httpStatus: HttpStatus.UNAUTHORIZED,
  });
}

function isUsableRefreshToken(token: RefreshTokenWithUser | null): token is RefreshTokenWithUser {
  return token !== null && token.revokedAt === null && token.expiresAt > new Date();
}

function clientMetadata(context: AuthRequestContext): Record<string, string> {
  const meta: Record<string, string> = {};
  if (context.ipAddr !== undefined && context.ipAddr.length > 0) meta.ip = context.ipAddr;
  if (context.userAgent !== undefined && context.userAgent.length > 0) {
    meta.userAgent = context.userAgent.slice(0, 256);
  }
  return meta;
}
