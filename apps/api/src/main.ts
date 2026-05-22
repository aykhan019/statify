import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api/v1', { exclude: ['healthz'] });

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Statify API listening on http://localhost:${port}`);
}

void bootstrap();
