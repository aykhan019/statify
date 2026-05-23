import { Controller, Get, Query } from '@nestjs/common';
import {
  CatalogSearchQuery,
  CatalogSearchQuerySchema,
  CatalogSearchResponse,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  search(
    @Query(new ZodValidationPipe(CatalogSearchQuerySchema))
    query: CatalogSearchQuery,
  ): Promise<CatalogSearchResponse> {
    return this.service.search(query);
  }
}
