import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AppError, COOKIE_NAMES, ErrorCode, HEADERS } from '@statify/shared';
import type { Request } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { getCookie } from '../cookie.utils';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(request.method)) {
      return true;
    }

    const headerToken = request.get(HEADERS.CSRF);
    const cookieToken = getCookie(request, COOKIE_NAMES.CSRF);

    if (!tokensMatch(headerToken, cookieToken)) {
      throw new AppError({
        code: ErrorCode.CSRF_INVALID,
        message: 'Invalid CSRF token',
        httpStatus: HttpStatus.FORBIDDEN,
      });
    }

    return true;
  }
}

function tokensMatch(headerToken: string | undefined, cookieToken: string | undefined): boolean {
  if (headerToken === undefined || cookieToken === undefined) {
    return false;
  }

  const header = Buffer.from(headerToken);
  const cookie = Buffer.from(cookieToken);

  return header.length === cookie.length && timingSafeEqual(header, cookie);
}
