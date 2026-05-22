import { Module } from '@nestjs/common';
import { HEADERS } from '@statify/shared';
import { LoggerModule as PinoLoggerModule, type Params } from 'nestjs-pino';
import type { Options } from 'pino-http';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { assignRequestId, getRequestId, resolveRequestId } from './request-id.middleware';

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  '*.password_hash',
  '*.token_hash',
  '*.refreshToken',
  '*.accessToken',
] as const;

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): Params => ({
        pinoHttp: createPinoHttpOptions(config),
      }),
    }),
  ],
})
export class LoggerModule {}

function createPinoHttpOptions(config: ConfigService): Options {
  return {
    level: resolveRuntimeLogLevel(config),
    transport: config.isDevelopment
      ? { target: 'pino-pretty', options: { singleLine: true } }
      : undefined,
    redact: {
      paths: [...REDACT_PATHS],
      censor: '[Redacted]',
    },
    genReqId: (request, response) => {
      const requestId = resolveRequestId(request);

      assignRequestId(request, requestId);
      response.setHeader(HEADERS.REQUEST_ID, requestId);

      return requestId;
    },
    customProps: (request) => ({
      requestId: getRequestId(request),
    }),
  };
}

function resolveRuntimeLogLevel(config: ConfigService): Options['level'] {
  if (config.isTest && !config.debugTests) {
    return 'silent';
  }

  return config.logLevel;
}
