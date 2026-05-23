import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TrackDetail, TrackListResponse, TracksQuery, TracksQuerySchema } from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
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
}
