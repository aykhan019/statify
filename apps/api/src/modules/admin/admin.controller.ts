import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { AppError, ErrorCode, type AdminStatusResponse } from '@statify/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  @Get('status')
  status(@CurrentUser() user: AuthenticatedUser | undefined): AdminStatusResponse {
    if (user === undefined) {
      throw new AppError({
        code: ErrorCode.UNAUTHENTICATED,
        message: 'Authentication required',
        httpStatus: HttpStatus.UNAUTHORIZED,
      });
    }

    if (user.role !== 'admin') {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        message: 'Forbidden',
        httpStatus: HttpStatus.FORBIDDEN,
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: 'admin',
      },
    };
  }
}
