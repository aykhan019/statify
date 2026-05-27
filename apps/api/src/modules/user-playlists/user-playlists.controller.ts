import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AddUserPlaylistTrackRequestSchema,
  CreateUserPlaylistRequestSchema,
  ReorderUserPlaylistTracksRequestSchema,
  UpdateUserPlaylistRequestSchema,
  UpdateUserPlaylistVisibilityRequestSchema,
  UserPlaylistTracksQuerySchema,
  UserPlaylistsListQuerySchema,
  type AddUserPlaylistTrackRequest,
  type CreateUserPlaylistRequest,
  type ReorderUserPlaylistTracksRequest,
  type UpdateUserPlaylistRequest,
  type UpdateUserPlaylistVisibilityRequest,
  type UserPlaylistDetail,
  type UserPlaylistListResponse,
  type UserPlaylistTracksQuery,
  type UserPlaylistTracksResponse,
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

  @Get(':id')
  getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPlaylistDetail> {
    return this.service.getOwnedById(user.id, id);
  }

  @Get(':id/tracks')
  listTracks(
    @Param('id', ParseIntPipe) id: number,
    @Query(new ZodValidationPipe(UserPlaylistTracksQuerySchema)) query: UserPlaylistTracksQuery,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPlaylistTracksResponse> {
    return this.service.listTracks(user.id, id, query);
  }

  @Patch(':id')
  @UseGuards(CsrfGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateUserPlaylistRequestSchema)) body: UpdateUserPlaylistRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPlaylistDetail> {
    return this.service.update(user.id, id, body);
  }

  @Patch(':id/visibility')
  @UseGuards(CsrfGuard)
  setVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateUserPlaylistVisibilityRequestSchema))
    body: UpdateUserPlaylistVisibilityRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPlaylistDetail> {
    return this.service.setVisibility(user.id, id, body.isPublic);
  }

  @Post(':id/tracks')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(CsrfGuard)
  addTrack(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AddUserPlaylistTrackRequestSchema))
    body: AddUserPlaylistTrackRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPlaylistDetail> {
    return this.service.addTrack(user.id, id, body.trackId);
  }

  @Delete(':id/tracks/:trackId')
  @UseGuards(CsrfGuard)
  removeTrack(
    @Param('id', ParseIntPipe) id: number,
    @Param('trackId', ParseIntPipe) trackId: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPlaylistDetail> {
    return this.service.removeTrack(user.id, id, trackId);
  }

  @Patch(':id/tracks/order')
  @UseGuards(CsrfGuard)
  reorderTracks(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(ReorderUserPlaylistTracksRequestSchema))
    body: ReorderUserPlaylistTracksRequest,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPlaylistDetail> {
    return this.service.reorderTracks(user.id, id, body.trackIds);
  }
}
