import { describe, expect, it } from 'vitest';
import { parseEnv } from './env.schema';

const VALID_ENV = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://statify:statify@localhost:5432/statify?schema=public',
  DIRECT_URL: 'postgresql://statify:statify@localhost:5432/statify?schema=public',
  API_BASE_URL: 'http://localhost:4000',
  ALLOWED_ORIGINS: 'http://localhost:3000',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  COOKIE_SECURE: 'false',
  SENTRY_DSN: '',
  ITUNES_API_BASE_URL: 'https://itunes.apple.com',
};

describe('EnvSchema', () => {
  it('accepts a valid API environment', () => {
    const env = parseEnv(VALID_ENV);

    expect(env).toMatchObject({
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
      DEBUG_TESTS: false,
      API_PORT: 4000,
      COOKIE_SECURE: false,
    });
  });

  it('throws a clear error for a missing required value', () => {
    const { DATABASE_URL: _databaseUrl, ...raw } = VALID_ENV;

    expect(() => parseEnv(raw)).toThrow(/DATABASE_URL/);
  });

  it('rejects malformed URLs', () => {
    expect(() => parseEnv({ ...VALID_ENV, API_BASE_URL: 'not-a-url' })).toThrow(/API_BASE_URL/);
  });

  it('rejects JWT secrets shorter than 32 characters', () => {
    expect(() => parseEnv({ ...VALID_ENV, JWT_ACCESS_SECRET: 'short' })).toThrow(
      /JWT_ACCESS_SECRET/,
    );
  });

  it('coerces COOKIE_SECURE from boolean and string values', () => {
    expect(parseEnv({ ...VALID_ENV, COOKIE_SECURE: true }).COOKIE_SECURE).toBe(true);
    expect(parseEnv({ ...VALID_ENV, COOKIE_SECURE: 'true' }).COOKIE_SECURE).toBe(true);
    expect(parseEnv({ ...VALID_ENV, COOKIE_SECURE: false }).COOKIE_SECURE).toBe(false);
    expect(parseEnv({ ...VALID_ENV, COOKIE_SECURE: 'false' }).COOKIE_SECURE).toBe(false);
  });

  it('uses production and test log defaults when LOG_LEVEL is omitted', () => {
    expect(parseEnv({ ...VALID_ENV, NODE_ENV: 'production' }).LOG_LEVEL).toBe('info');
    expect(parseEnv({ ...VALID_ENV, NODE_ENV: 'test' }).LOG_LEVEL).toBe('warn');
  });
});
