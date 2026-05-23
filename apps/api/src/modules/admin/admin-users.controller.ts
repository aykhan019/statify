import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AdminUsersListQuerySchema,
  UpdateUserBanRequestSchema,
  UpdateUserRoleRequestSchema,
  type AdminUserListItem,
  type AdminUserListResponse,
  type AdminUsersListQuery,
  type UpdateUserBanRequest,
  type UpdateUserRoleRequest,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AdminUsersListQuerySchema)) query: AdminUsersListQuery,
  ): Promise<AdminUserListResponse> {
    return this.service.list(query);
  }

  @Patch(':id/role')
  @UseGuards(CsrfGuard)
  setRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateUserRoleRequestSchema)) body: UpdateUserRoleRequest,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AdminUserListItem> {
    return this.service.setRole(actor.id, id, body.role);
  }

  @Patch(':id/ban')
  @UseGuards(CsrfGuard)
  setBan(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateUserBanRequestSchema)) body: UpdateUserBanRequest,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AdminUserListItem> {
    return this.service.setBan(actor.id, id, body.banned);
  }
}
