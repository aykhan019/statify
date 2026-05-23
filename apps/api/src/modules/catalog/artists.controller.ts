import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ArtistDetail,
  ArtistListResponse,
  ArtistsQuery,
  ArtistsQuerySchema,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly service: ArtistsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(ArtistsQuerySchema))
    query: ArtistsQuery,
  ): Promise<ArtistListResponse> {
    return this.service.list(query);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<ArtistDetail> {
    return this.service.getById(id);
  }
}
