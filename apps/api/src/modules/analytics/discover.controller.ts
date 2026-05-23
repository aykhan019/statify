import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DiscoverQuery, DiscoverQuerySchema, DiscoverResponse } from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('discover')
@UseGuards(JwtAuthGuard)
export class DiscoverController {
  constructor(private readonly service: AnalyticsService) {}

  @Get()
  discover(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(DiscoverQuerySchema)) query: DiscoverQuery,
  ): Promise<DiscoverResponse> {
    return this.service.discover(user.id, query);
  }
}
