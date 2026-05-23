import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  type MpdPlaylistDetail,
  type MpdPlaylistListResponse,
  type MpdPlaylistTracksQuery,
  type MpdPlaylistTracksResponse,
  type MpdPlaylistsQuery,
  MpdPlaylistTracksQuerySchema,
  MpdPlaylistsQuerySchema,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { MpdPlaylistsService } from './mpd-playlists.service';

@Controller('playlists')
export class MpdPlaylistsController {
  constructor(private readonly service: MpdPlaylistsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(MpdPlaylistsQuerySchema)) query: MpdPlaylistsQuery,
  ): Promise<MpdPlaylistListResponse> {
    return this.service.list(query);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<MpdPlaylistDetail> {
    return this.service.getById(id);
  }

  @Get(':id/tracks')
  listTracks(
    @Param('id', ParseIntPipe) id: number,
    @Query(new ZodValidationPipe(MpdPlaylistTracksQuerySchema)) query: MpdPlaylistTracksQuery,
  ): Promise<MpdPlaylistTracksResponse> {
    return this.service.listTracks(id, query);
  }
}
