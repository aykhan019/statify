import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { AlbumDetail, AlbumListResponse, AlbumsQuery, AlbumsQuerySchema } from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AlbumsService } from './albums.service';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly service: AlbumsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AlbumsQuerySchema))
    query: AlbumsQuery,
  ): Promise<AlbumListResponse> {
    return this.service.list(query);
  }

  @Get(':id')
  getById(@Param('id', ParseIntPipe) id: number): Promise<AlbumDetail> {
    return this.service.getById(id);
  }
}
