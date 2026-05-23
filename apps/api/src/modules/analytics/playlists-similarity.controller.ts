import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  SimilarPlaylistsQuery,
  SimilarPlaylistsQuerySchema,
  SimilarPlaylistsResponse,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AnalyticsService } from './analytics.service';

@Controller('playlists')
export class PlaylistsSimilarityController {
  constructor(private readonly service: AnalyticsService) {}

  @Get(':id/similar')
  similar(
    @Param('id', ParseIntPipe) id: number,
    @Query(new ZodValidationPipe(SimilarPlaylistsQuerySchema)) query: SimilarPlaylistsQuery,
  ): Promise<SimilarPlaylistsResponse> {
    return this.service.similarPlaylists(id, query);
  }
}
