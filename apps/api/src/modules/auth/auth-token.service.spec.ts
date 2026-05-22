import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';
import type { ConfigService } from '../../config/config.service';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  it('creates verifiable access and refresh tokens plus a refresh hash', async () => {
    const service = new AuthTokenService(createConfig(), new JwtService());

    const tokens = await service.createTokenSet({
      id: 1,
      email: 'user@example.com',
      displayName: 'User',
      role: 'user',
    });

    await expect(service.verifyAccessToken(tokens.accessToken)).resolves.toMatchObject({
      sub: 1,
      type: 'access',
      role: 'user',
    });
    await expect(service.verifyRefreshToken(tokens.refreshToken)).resolves.toMatchObject({
      sub: 1,
      type: 'refresh',
      role: 'user',
    });
    expect(tokens.refreshTokenHash).toHaveLength(64);
    expect(tokens.csrfToken).toHaveLength(43);
  });
});

function createConfig(): ConfigService {
  return {
    jwtAccessSecret: 'a'.repeat(32),
    jwtRefreshSecret: 'b'.repeat(32),
    jwtAccessTtl: '15m',
    jwtRefreshTtl: '30d',
  } as ConfigService;
}
