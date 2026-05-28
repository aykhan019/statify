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
  AdminTracksListQuerySchema,
  UpdateAdminTrackHiddenRequestSchema,
  UpdateAdminTrackRequestSchema,
  type AdminTrackListItem,
  type AdminTrackListResponse,
  type AdminTracksListQuery,
  type UpdateAdminTrackHiddenRequest,
  type UpdateAdminTrackRequest,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminTracksService } from './admin-tracks.service';

@Controller('admin/tracks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminTracksController {
  constructor(private readonly service: AdminTracksService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AdminTracksListQuerySchema)) query: AdminTracksListQuery,
  ): Promise<AdminTrackListResponse> {
    return this.service.list(query);
  }

  @Patch(':id')
  @UseGuards(CsrfGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateAdminTrackRequestSchema)) body: UpdateAdminTrackRequest,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AdminTrackListItem> {
    return this.service.update(actor.id, id, body);
  }

  @Patch(':id/hidden')
  @UseGuards(CsrfGuard)
  setHidden(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateAdminTrackHiddenRequestSchema))
    body: UpdateAdminTrackHiddenRequest,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AdminTrackListItem> {
    return this.service.setHidden(actor.id, id, body.hidden);
  }
}
