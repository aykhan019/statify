import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AuditLogRepository, AuditLogService],
  exports: [AuditLogService],
})
export class AdminModule {}
