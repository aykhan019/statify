import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { Env, LogLevel, NodeEnv } from './env.schema';

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService<Env, true>) {}

  get nodeEnv(): NodeEnv {
    return this.get('NODE_ENV');
  }

  get logLevel(): LogLevel {
    return this.get('LOG_LEVEL');
  }

  get debugTests(): boolean {
    return this.get('DEBUG_TESTS');
  }

  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  get directUrl(): string | undefined {
    return this.getOptional('DIRECT_URL');
  }

  get apiPort(): number {
    return this.get('API_PORT');
  }

  get apiBaseUrl(): string {
    return this.get('API_BASE_URL');
  }

  get allowedOrigins(): string[] {
    return this.get('ALLOWED_ORIGINS')
      .split(',')
      .map((origin: string) => origin.trim())
      .filter(Boolean);
  }

  get jwtAccessSecret(): string {
    return this.get('JWT_ACCESS_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.get('JWT_REFRESH_SECRET');
  }

  get jwtAccessTtl(): string {
    return this.get('JWT_ACCESS_TTL');
  }

  get jwtRefreshTtl(): string {
    return this.get('JWT_REFRESH_TTL');
  }

  get cookieDomain(): string {
    return this.get('COOKIE_DOMAIN');
  }

  get cookieSecure(): boolean {
    return this.get('COOKIE_SECURE');
  }

  get sentryDsn(): string {
    return this.get('SENTRY_DSN');
  }

  get itunesApiBaseUrl(): string {
    return this.get('ITUNES_API_BASE_URL');
  }

  get itunesRateLimitRps(): number {
    return this.get('ITUNES_RATE_LIMIT_RPS');
  }

  get itunesRequestTimeoutMs(): number {
    return this.get('ITUNES_REQUEST_TIMEOUT_MS');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  private get<K extends keyof Env>(key: K): Env[K] {
    return this.config.getOrThrow<Env, K, Env[K]>(key, { infer: true });
  }

  private getOptional<K extends keyof Env>(key: K): Env[K] {
    return this.config.get<Env, K, Env[K]>(key, { infer: true });
  }
}
