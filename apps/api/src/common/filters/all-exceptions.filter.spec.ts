import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
} from '@nestjs/common';
import { AppError, ErrorCode } from '@statify/shared';
import * as Sentry from '@sentry/node';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { AllExceptionsFilter } from './all-exceptions.filter';

vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
}));

describe('AllExceptionsFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  it('serializes AppError into the standard envelope', () => {
    const { response, host } = createHost('request-1');
    const filter = new AllExceptionsFilter();

    filter.catch(
      new AppError({
        code: ErrorCode.CONFLICT,
        message: 'Email already exists',
        httpStatus: HttpStatus.CONFLICT,
        details: { field: 'email' },
      }),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.CONFLICT,
        message: 'Email already exists',
        details: { field: 'email' },
      },
      requestId: 'request-1',
    });
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('maps framework validation errors to validation envelopes', () => {
    const { response, host } = createHost('request-2');
    const filter = new AllExceptionsFilter();

    filter.catch(new BadRequestException(['email must be valid']), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: ['email must be valid'],
      },
      requestId: 'request-2',
    });
  });

  it('preserves explicit error codes from HTTP exception bodies', () => {
    const { response, host } = createHost('request-3');
    const filter = new AllExceptionsFilter();

    filter.catch(
      new ConflictException({
        code: ErrorCode.EMAIL_TAKEN,
        message: 'Email is already registered',
      }),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.EMAIL_TAKEN,
        message: 'Email is already registered',
      },
      requestId: 'request-3',
    });
  });

  it('serializes ZodError details', () => {
    const { response, host } = createHost('request-4');
    const filter = new AllExceptionsFilter();
    const result = z.object({ limit: z.number() }).safeParse({ limit: 'x' });

    if (result.success) {
      throw new Error('Expected validation to fail');
    }

    filter.catch(result.error, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: result.error.issues,
      },
      requestId: 'request-4',
    });
  });

  it('hides unexpected error messages and captures server failures', () => {
    const { response, host } = createHost('request-5');
    const filter = new AllExceptionsFilter();
    const exception = new Error('database password leaked in stack');

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
      },
      requestId: 'request-5',
    });
    expect(Sentry.captureException).toHaveBeenCalledWith(exception);
  });
});

function createHost(requestId: string): {
  response: Pick<Response, 'status' | 'json'>;
  host: ArgumentsHost;
} {
  const request = { id: requestId } as Request;
  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as Pick<Response, 'status' | 'json'>;
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as ArgumentsHost;

  return { response, host };
}
