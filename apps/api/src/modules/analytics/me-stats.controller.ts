import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  HeatmapResponse,
  TopArtistsQuery,
  TopArtistsQuerySchema,
  TopArtistsResponse,
  TopTracksQuery,
  TopTracksQuerySchema,
  TopTracksResponse,
  TrendingQuery,
  TrendingQuerySchema,
  TrendingResponse,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('me/stats')
@UseGuards(JwtAuthGuard)
export class MeStatsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('top-artists')
  topArtists(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(TopArtistsQuerySchema)) query: TopArtistsQuery,
  ): Promise<TopArtistsResponse> {
    return this.service.topArtists(user.id, query);
  }

  @Get('top-tracks')
  topTracks(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(TopTracksQuerySchema)) query: TopTracksQuery,
  ): Promise<TopTracksResponse> {
    return this.service.topTracks(user.id, query);
  }

  @Get('heatmap')
  heatmap(@CurrentUser() user: AuthenticatedUser): Promise<HeatmapResponse> {
    return this.service.heatmap(user.id);
  }

  @Get('trending')
  trending(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(TrendingQuerySchema)) query: TrendingQuery,
  ): Promise<TrendingResponse> {
    return this.service.trending(user.id, query);
  }
}
