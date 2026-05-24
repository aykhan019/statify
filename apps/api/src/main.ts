import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from './config/config.service';
import { loadEnv } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const env = loadEnv();

  if (env.SENTRY_DSN !== '') {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
  }

  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionsFilter());

  const config = app.get(ConfigService);
  app.enableCors({
    origin: config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api/v1', { exclude: ['healthz'] });

  const port = config.apiPort;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Statify API listening on http://localhost:${port}`);
}

void bootstrap();
