import { Controller, Get, Query } from '@nestjs/common';
import { HiddenGemsQuery, HiddenGemsQuerySchema, HiddenGemsResponse } from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AnalyticsService } from './analytics.service';

@Controller('explore')
export class ExploreController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('hidden-gems')
  hiddenGems(
    @Query(new ZodValidationPipe(HiddenGemsQuerySchema)) query: HiddenGemsQuery,
  ): Promise<HiddenGemsResponse> {
    return this.service.hiddenGems(query);
  }
}
