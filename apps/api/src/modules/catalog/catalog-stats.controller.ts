import { Controller, Get } from '@nestjs/common';
import type { CatalogStatsResponse } from '@statify/shared';
import { CatalogStatsService } from './catalog-stats.service';

@Controller('catalog')
export class CatalogStatsController {
  constructor(private readonly service: CatalogStatsService) {}

  @Get('stats')
  getStats(): Promise<CatalogStatsResponse> {
    return this.service.getStats();
  }
}
