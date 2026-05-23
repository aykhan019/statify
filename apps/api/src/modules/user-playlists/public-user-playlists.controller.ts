import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import {
  UserPlaylistTracksQuerySchema,
  UserPlaylistsListQuerySchema,
  type UserPlaylistDetail,
  type UserPlaylistListResponse,
  type UserPlaylistTracksQuery,
  type UserPlaylistTracksResponse,
  type UserPlaylistsListQuery,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPlaylistsService } from './user-playlists.service';

@Controller('user-playlists')
@UseGuards(JwtAuthGuard)
export class PublicUserPlaylistsController {
  constructor(private readonly service: UserPlaylistsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(UserPlaylistsListQuerySchema)) query: UserPlaylistsListQuery,
  ): Promise<UserPlaylistListResponse> {
    return this.service.listPublic(query);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<UserPlaylistDetail> {
    return this.service.getPublicById(id);
  }

  @Get(':id/tracks')
  listTracks(
    @Param('id', ParseIntPipe) id: number,
    @Query(new ZodValidationPipe(UserPlaylistTracksQuerySchema)) query: UserPlaylistTracksQuery,
  ): Promise<UserPlaylistTracksResponse> {
    return this.service.listPublicTracks(id, query);
  }
}
