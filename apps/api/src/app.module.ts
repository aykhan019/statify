import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from './common/logger/logger.module';
import { RequestIdMiddleware } from './common/logger/request-id.middleware';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [ConfigModule, LoggerModule, PrismaModule, HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
