import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import type { AuthRequestContext, AuthTokenSet } from './auth.types';

export type RefreshTokenWithUser = Prisma.RefreshTokenGetPayload<{
  include: { user: true };
}>;

@Injectable()
export class AuthRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super(prisma);
  }

  findUserByEmail(email: string): Promise<User | null> {
    return this.client.user.findUnique({ where: { email } });
  }

  findUserById(id: number): Promise<User | null> {
    return this.client.user.findUnique({ where: { id } });
  }

  createUser(data: { email: string; passwordHash: string; displayName: string }): Promise<User> {
    return this.client.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
      },
    });
  }

  updateLastLoginAt(userId: number): Promise<User> {
    return this.client.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  createRefreshToken(
    userId: number,
    tokens: AuthTokenSet,
    context: AuthRequestContext,
  ): Promise<unknown> {
    return this.client.refreshToken.create({
      data: {
        userId,
        tokenHash: tokens.refreshTokenHash,
        expiresAt: tokens.refreshTokenExpiresAt,
        userAgent: context.userAgent,
        ipAddr: context.ipAddr,
      },
    });
  }

  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenWithUser | null> {
    return this.client.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  rotateRefreshToken(
    refreshTokenId: number,
    userId: number,
    tokens: AuthTokenSet,
    context: AuthRequestContext,
  ): Promise<void> {
    return this.prisma.transaction(async (client) => {
      await client.refreshToken.update({
        where: { id: refreshTokenId },
        data: { revokedAt: new Date() },
      });
      await client.refreshToken.create({
        data: {
          userId,
          tokenHash: tokens.refreshTokenHash,
          expiresAt: tokens.refreshTokenExpiresAt,
          userAgent: context.userAgent,
          ipAddr: context.ipAddr,
        },
      });
    });
  }
}
