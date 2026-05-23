import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnalyticsService } from './analytics.service';
import { DiscoverController } from './discover.controller';
import { ExploreController } from './explore.controller';
import { MeStatsController } from './me-stats.controller';
import { PlaylistsSimilarityController } from './playlists-similarity.controller';

@Module({
  imports: [AuthModule],
  controllers: [
    DiscoverController,
    ExploreController,
    MeStatsController,
    PlaylistsSimilarityController,
  ],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
