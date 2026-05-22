import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppError, ErrorCode, type UserRole } from '@statify/shared';
import type { Request } from 'express';
import type { RequestWithUser } from '../auth.types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles === undefined || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & RequestWithUser>();
    if (request.user === undefined) {
      throw new AppError({
        code: ErrorCode.UNAUTHENTICATED,
        message: 'Authentication required',
        httpStatus: HttpStatus.UNAUTHORIZED,
      });
    }

    if (!roles.includes(request.user.role)) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        message: 'Forbidden',
        httpStatus: HttpStatus.FORBIDDEN,
      });
    }

    return true;
  }
}
