import type { ConfigService as NestConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import { ConfigService } from './config.service';
import { parseEnv, type Env } from './env.schema';

const VALID_ENV = {
  NODE_ENV: 'production',
  LOG_LEVEL: 'error',
  DEBUG_TESTS: '1',
  DATABASE_URL: 'postgresql://statify:statify@localhost:5432/statify?schema=public',
  DIRECT_URL: '',
  API_PORT: '5000',
  API_BASE_URL: 'https://api.statify.test',
  ALLOWED_ORIGINS: 'https://statify.test, https://admin.statify.test',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  JWT_ACCESS_TTL: '10m',
  JWT_REFRESH_TTL: '14d',
  COOKIE_DOMAIN: 'statify.test',
  COOKIE_SECURE: 'true',
  SENTRY_DSN: 'https://public@example.com/1',
  ITUNES_API_BASE_URL: 'https://itunes.apple.com',
  ITUNES_RATE_LIMIT_RPS: '12',
  ITUNES_REQUEST_TIMEOUT_MS: '2500',
};

describe('ConfigService', () => {
  it('exposes typed values from the parsed environment', () => {
    const service = createService(parseEnv(VALID_ENV));

    expect(service.nodeEnv).toBe('production');
    expect(service.logLevel).toBe('error');
    expect(service.debugTests).toBe(true);
    expect(service.databaseUrl).toBe(VALID_ENV.DATABASE_URL);
    expect(service.directUrl).toBeUndefined();
    expect(service.apiPort).toBe(5000);
    expect(service.apiBaseUrl).toBe('https://api.statify.test');
    expect(service.allowedOrigins).toEqual(['https://statify.test', 'https://admin.statify.test']);
    expect(service.jwtAccessSecret).toHaveLength(32);
    expect(service.jwtRefreshSecret).toHaveLength(32);
    expect(service.jwtAccessTtl).toBe('10m');
    expect(service.jwtRefreshTtl).toBe('14d');
    expect(service.cookieDomain).toBe('statify.test');
    expect(service.cookieSecure).toBe(true);
    expect(service.sentryDsn).toBe('https://public@example.com/1');
    expect(service.itunesApiBaseUrl).toBe('https://itunes.apple.com');
    expect(service.itunesRateLimitRps).toBe(12);
    expect(service.itunesRequestTimeoutMs).toBe(2500);
    expect(service.isProduction).toBe(true);
    expect(service.isDevelopment).toBe(false);
    expect(service.isTest).toBe(false);
  });
});

function createService(env: Env): ConfigService {
  const nestConfig = {
    get: <K extends keyof Env>(key: K) => env[key],
    getOrThrow: <K extends keyof Env>(key: K) => env[key],
  } as NestConfigService<Env, true>;

  return new ConfigService(nestConfig);
}
