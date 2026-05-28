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
  AdminArtistsListQuerySchema,
  UpdateAdminArtistHiddenRequestSchema,
  UpdateAdminArtistRequestSchema,
  type AdminArtistListItem,
  type AdminArtistListResponse,
  type AdminArtistsListQuery,
  type UpdateAdminArtistHiddenRequest,
  type UpdateAdminArtistRequest,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminArtistsService } from './admin-artists.service';

@Controller('admin/artists')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminArtistsController {
  constructor(private readonly service: AdminArtistsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AdminArtistsListQuerySchema)) query: AdminArtistsListQuery,
  ): Promise<AdminArtistListResponse> {
    return this.service.list(query);
  }

  @Patch(':id')
  @UseGuards(CsrfGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateAdminArtistRequestSchema)) body: UpdateAdminArtistRequest,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AdminArtistListItem> {
    return this.service.update(actor.id, id, body);
  }

  @Patch(':id/hidden')
  @UseGuards(CsrfGuard)
  setHidden(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateAdminArtistHiddenRequestSchema))
    body: UpdateAdminArtistHiddenRequest,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<AdminArtistListItem> {
    return this.service.setHidden(actor.id, id, body.hidden);
  }
}
