import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { TrackDetail, TrackListResponse, TracksQuery, TracksQuerySchema } from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TracksService } from './tracks.service';

@Controller('tracks')
export class TracksController {
  constructor(private readonly service: TracksService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(TracksQuerySchema))
    query: TracksQuery,
  ): Promise<TrackListResponse> {
    return this.service.list(query);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<TrackDetail> {
    return this.service.getById(id);
  }

  @Post(':id/preview')
  @UseGuards(JwtAuthGuard, CsrfGuard)
  resolvePreview(@Param('id', ParseIntPipe) id: number): Promise<TrackDetail> {
    return this.service.resolvePreviewById(id);
  }
}
