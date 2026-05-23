import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from './common/logger/logger.module';
import { RequestIdMiddleware } from './common/logger/request-id.middleware';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './database/prisma.module';
import { ItunesModule } from './integrations/itunes/itunes.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { HealthModule } from './modules/health/health.module';
import { HistoryModule } from './modules/history/history.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    PrismaModule,
    ItunesModule,
    AuthModule,
    CatalogModule,
    HealthModule,
    HistoryModule,
    AnalyticsModule,
    AdminModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
