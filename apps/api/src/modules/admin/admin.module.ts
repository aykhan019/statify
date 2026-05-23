import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminIngestController } from './admin-ingest.controller';
import { AdminIngestRepository } from './admin-ingest.repository';
import { AdminIngestService } from './admin-ingest.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersRepository } from './admin-users.repository';
import { AdminUsersService } from './admin-users.service';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, AdminUsersController, AdminIngestController],
  providers: [
    AdminIngestRepository,
    AdminIngestService,
    AdminUsersRepository,
    AdminUsersService,
    AuditLogRepository,
    AuditLogService,
  ],
  exports: [AuditLogService],
})
export class AdminModule {}
