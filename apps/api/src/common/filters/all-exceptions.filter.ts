import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AppError, ErrorCode, isErrorCode, type ErrorEnvelope } from '@statify/shared';
import * as Sentry from '@sentry/node';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { getRequestId } from '../logger/request-id.middleware';

interface ResolvedException {
  status: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = getRequestId(request);

    const resolved = resolveException(exception);

    if (resolved.status >= 500) {
      Sentry.captureException(exception);
      this.logger.error({ err: exception, requestId, code: resolved.code }, 'Unhandled exception');
    } else {
      this.logger.warn(
        { requestId, code: resolved.code, status: resolved.status },
        resolved.message,
      );
    }

    response.status(resolved.status).json({
      error: {
        code: resolved.code,
        message: resolved.message,
        ...(resolved.details !== undefined ? { details: resolved.details } : {}),
      },
      requestId,
    } satisfies ErrorEnvelope);
  }
}

function resolveException(exception: unknown): ResolvedException {
  if (exception instanceof AppError) {
    return {
      status: exception.httpStatus,
      code: exception.code,
      message: exception.message,
      details: exception.details,
    };
  }
  if (exception instanceof ZodError) {
    return {
      status: HttpStatus.BAD_REQUEST,
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details: exception.issues,
    };
  }
  if (exception instanceof HttpException) {
    return resolveHttpException(exception);
  }
  if (exception instanceof Error) {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
    };
  }
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCode.INTERNAL_ERROR,
    message: 'Internal server error',
  };
}

function resolveHttpException(exception: HttpException): ResolvedException {
  const status = exception.getStatus();
  const res = exception.getResponse();
  if (typeof res === 'string') {
    return { status, code: mapStatusToCode(status), message: res };
  }
  if (isRecord(res)) {
    return resolveHttpExceptionObject(status, res);
  }
  return {
    status,
    code: mapStatusToCode(status),
    message: status >= 500 ? 'Internal server error' : exception.message,
  };
}

function resolveHttpExceptionObject(
  status: number,
  body: Record<string, unknown>,
): ResolvedException {
  const code = isErrorCode(body.code) ? body.code : mapStatusToCode(status);
  const message = resolveMessage(body.message, status);

  return {
    status,
    code,
    message,
    ...(body.details !== undefined ? { details: body.details } : {}),
    ...(Array.isArray(body.message) ? { details: body.message } : {}),
  };
}

function resolveMessage(message: unknown, status: number): string {
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message)) {
    return 'Validation failed';
  }
  return status >= 500 ? 'Internal server error' : 'Request failed';
}

function mapStatusToCode(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return ErrorCode.VALIDATION_ERROR;
    case HttpStatus.UNAUTHORIZED:
      return ErrorCode.UNAUTHENTICATED;
    case HttpStatus.FORBIDDEN:
      return ErrorCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case HttpStatus.CONFLICT:
      return ErrorCode.CONFLICT;
    case HttpStatus.TOO_MANY_REQUESTS:
      return ErrorCode.RATE_LIMITED;
    default:
      return ErrorCode.INTERNAL_ERROR;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
