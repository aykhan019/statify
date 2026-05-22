import { z } from 'zod';

const NodeEnvSchema = z.enum(['development', 'test', 'production']);
const LogLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);

export type NodeEnv = z.infer<typeof NodeEnvSchema>;
export type LogLevel = z.infer<typeof LogLevelSchema>;

const BooleanFromEnvSchema = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((value) => value === true || value === 'true');

const DebugTestsSchema = z
  .union([z.boolean(), z.enum(['1', '0', 'true', 'false'])])
  .default('0')
  .transform((value) => value === true || value === '1' || value === 'true');

const OptionalUrlSchema = z
  .union([z.string().url(), z.literal('')])
  .optional()
  .transform((value) => (value === '' ? undefined : value));

export const EnvSchema = z
  .object({
    NODE_ENV: NodeEnvSchema.default('development'),
    LOG_LEVEL: LogLevelSchema.optional(),
    DEBUG_TESTS: DebugTestsSchema,

    DATABASE_URL: z.string().url(),
    DIRECT_URL: OptionalUrlSchema,

    API_PORT: z.coerce.number().int().default(4000),
    API_BASE_URL: z.string().url(),
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL: z.string().default('15m'),
    JWT_REFRESH_TTL: z.string().default('30d'),

    COOKIE_DOMAIN: z.string().default('localhost'),
    COOKIE_SECURE: BooleanFromEnvSchema.default('false'),

    SENTRY_DSN: z.string().url().optional().or(z.literal('')).default(''),

    ITUNES_API_BASE_URL: z.string().url().default('https://itunes.apple.com'),
    ITUNES_RATE_LIMIT_RPS: z.coerce.number().int().default(20),
    ITUNES_REQUEST_TIMEOUT_MS: z.coerce.number().int().default(5000),
  })
  .transform((env) => ({
    ...env,
    LOG_LEVEL: env.LOG_LEVEL ?? getDefaultLogLevel(env.NODE_ENV),
  }));

export type Env = z.output<typeof EnvSchema>;

export function parseEnv(raw: Record<string, unknown>): Env {
  return EnvSchema.parse(raw);
}

export function loadEnv(): Env {
  return parseEnv(process.env);
}

function getDefaultLogLevel(nodeEnv: NodeEnv): LogLevel {
  switch (nodeEnv) {
    case 'development':
      return 'debug';
    case 'test':
      return 'warn';
    case 'production':
      return 'info';
  }
}
