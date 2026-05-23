import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HistoryController } from './history.controller';
import { ListeningHistoryRepository } from './listening-history.repository';
import { ListeningHistoryService } from './listening-history.service';

@Module({
  imports: [AuthModule],
  controllers: [HistoryController],
  providers: [ListeningHistoryRepository, ListeningHistoryService],
  exports: [ListeningHistoryService],
})
export class HistoryModule {}
