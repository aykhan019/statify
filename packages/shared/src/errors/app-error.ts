import type { ErrorCode } from './codes';

export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  httpStatus: number;
  details?: unknown;
  cause?: unknown;
}

export interface ErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly httpStatus: number;
  readonly details?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message, options.cause ? { cause: options.cause } : undefined);
    this.name = 'AppError';
    this.code = options.code;
    this.httpStatus = options.httpStatus;
    this.details = options.details;
  }
}
