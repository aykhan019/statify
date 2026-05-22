import { Injectable } from '@nestjs/common';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { AuthUser } from '@statify/shared';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { ConfigService } from '../../config/config.service';
import type { AuthTokenPayload, AuthTokenSet, AuthTokenType } from './auth.types';
import { durationToMs } from './duration';

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async createTokenSet(user: AuthUser): Promise<AuthTokenSet> {
    const refreshToken = await this.signToken(user, 'refresh', this.config.jwtRefreshTtl);

    return {
      accessToken: await this.signToken(user, 'access', this.config.jwtAccessTtl),
      refreshToken,
      refreshTokenHash: this.hashRefreshToken(refreshToken),
      refreshTokenExpiresAt: new Date(Date.now() + durationToMs(this.config.jwtRefreshTtl)),
      csrfToken: randomBytes(32).toString('base64url'),
    };
  }

  verifyAccessToken(token: string): Promise<AuthTokenPayload> {
    return this.verifyToken(token, this.config.jwtAccessSecret, 'access');
  }

  verifyRefreshToken(token: string): Promise<AuthTokenPayload> {
    return this.verifyToken(token, this.config.jwtRefreshSecret, 'refresh');
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private signToken(user: AuthUser, type: AuthTokenType, expiresIn: string): Promise<string> {
    return this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        type,
        jti: randomUUID(),
      } satisfies AuthTokenPayload,
      {
        secret: type === 'access' ? this.config.jwtAccessSecret : this.config.jwtRefreshSecret,
        expiresIn: expiresIn as JwtSignOptions['expiresIn'],
      },
    );
  }

  private async verifyToken(
    token: string,
    secret: string,
    expectedType: AuthTokenType,
  ): Promise<AuthTokenPayload> {
    const payload = await this.jwt.verifyAsync<AuthTokenPayload>(token, { secret });

    if (payload.type !== expectedType) {
      throw new Error('Invalid token type');
    }

    return payload;
  }
}
