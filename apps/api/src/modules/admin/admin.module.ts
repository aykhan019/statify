import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersRepository } from './admin-users.repository';
import { AdminUsersService } from './admin-users.service';
import { AuditLogRepository } from './audit-log.repository';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, AdminUsersController],
  providers: [AdminUsersRepository, AdminUsersService, AuditLogRepository, AuditLogService],
  exports: [AuditLogService],
})
export class AdminModule {}
