import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateUserPlaylistRequestSchema,
  UserPlaylistsListQuerySchema,
  type CreateUserPlaylistRequest,
  type UserPlaylistDetail,
  type UserPlaylistListResponse,
  type UserPlaylistsListQuery,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPlaylistsService } from './user-playlists.service';

@Controller('me/playlists')
@UseGuards(JwtAuthGuard)
export class UserPlaylistsController {
  constructor(private readonly service: UserPlaylistsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(CsrfGuard)
  create(
    @Body(new ZodValidationPipe(CreateUserPlaylistRequestSchema)) body: CreateUserPlaylistRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPlaylistDetail> {
    return this.service.create(user.id, body);
  }

  @Get()
  list(
    @Query(new ZodValidationPipe(UserPlaylistsListQuerySchema)) query: UserPlaylistsListQuery,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPlaylistListResponse> {
    return this.service.listForOwner(user.id, query);
  }
}
