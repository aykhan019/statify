import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AppError, COOKIE_NAMES, ErrorCode } from '@statify/shared';
import type { Request } from 'express';
import { AuthTokenService } from '../auth-token.service';
import type { RequestWithUser } from '../auth.types';
import { getCookie } from '../cookie.utils';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: AuthTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & RequestWithUser>();
    const accessToken = getCookie(request, COOKIE_NAMES.ACCESS);

    if (accessToken === undefined) {
      throw unauthenticatedError();
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(accessToken);

      request.user = {
        id: payload.sub,
        email: payload.email,
        displayName: payload.displayName,
        role: payload.role,
      };

      return true;
    } catch {
      throw unauthenticatedError();
    }
  }
}

function unauthenticatedError(): AppError {
  return new AppError({
    code: ErrorCode.UNAUTHENTICATED,
    message: 'Authentication required',
    httpStatus: HttpStatus.UNAUTHORIZED,
  });
}
