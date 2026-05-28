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
  AdminAlbumsListQuerySchema,
  UpdateAdminAlbumHiddenRequestSchema,
  UpdateAdminAlbumRequestSchema,
  type AdminAlbumListItem,
  type AdminAlbumListResponse,
  type AdminAlbumsListQuery,
  type UpdateAdminAlbumHiddenRequest,
  type UpdateAdminAlbumRequest,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminAlbumsService } from './admin-albums.service';

@Controller('admin/albums')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminAlbumsController {
  constructor(private readonly service: AdminAlbumsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AdminAlbumsListQuerySchema)) query: AdminAlbumsListQuery,
  ): Promise<AdminAlbumListResponse> {
    return this.service.list(query);
  }

  @Patch(':id')
  @UseGuards(CsrfGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateAdminAlbumRequestSchema)) body: UpdateAdminAlbumRequest,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AdminAlbumListItem> {
    return this.service.update(actor.id, id, body);
  }

  @Patch(':id/hidden')
  @UseGuards(CsrfGuard)
  setHidden(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateAdminAlbumHiddenRequestSchema))
    body: UpdateAdminAlbumHiddenRequest,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AdminAlbumListItem> {
    return this.service.setHidden(actor.id, id, body.hidden);
  }
}
