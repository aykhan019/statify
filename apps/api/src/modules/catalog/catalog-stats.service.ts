import { Injectable } from '@nestjs/common';
import type { CatalogStatsResponse } from '@statify/shared';
import { CatalogStatsRepository } from './catalog-stats.repository';

@Injectable()
export class CatalogStatsService {
  constructor(private readonly repository: CatalogStatsRepository) {}

  getStats(): Promise<CatalogStatsResponse> {
    return this.repository.counts();
  }
}
