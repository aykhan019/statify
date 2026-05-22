import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  API_PORT: z.coerce.number().int().default(4000),
  API_BASE_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .default('false')
    .transform((v) => v === true || v === 'true'),

  SENTRY_DSN: z.string().url().optional().or(z.literal('')).default(''),

  ITUNES_API_BASE_URL: z.string().url().default('https://itunes.apple.com'),
  ITUNES_RATE_LIMIT_RPS: z.coerce.number().int().default(20),
  ITUNES_REQUEST_TIMEOUT_MS: z.coerce.number().int().default(5000),
});

export type Env = z.infer<typeof EnvSchema>;
