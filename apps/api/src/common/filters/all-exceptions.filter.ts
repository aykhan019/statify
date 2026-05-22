import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppError, ErrorCode } from '@statify/shared';
import { ZodError } from 'zod';

interface ResolvedException {
  status: number;
  code: string;
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
    const requestId = (request.headers['x-request-id'] as string) ?? '';

    const resolved = resolveException(exception);

    if (resolved.status >= 500) {
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
    });
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
      message: exception.message,
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
  let message = 'Internal server error';
  if (typeof res === 'string') {
    message = res;
  } else if (typeof res === 'object' && res !== null) {
    const obj = res as Record<string, unknown>;
    message = (obj.message as string) ?? message;
  }
  return { status, code: mapStatusToCode(status), message };
}

function mapStatusToCode(status: number): string {
  switch (status) {
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
