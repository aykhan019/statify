import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  AuditLogListQuerySchema,
  type AuditLogListQuery,
  type AuditLogListResponse,
} from '@statify/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditLogService } from './audit-log.service';

@Controller('admin/audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminAuditController {
  constructor(private readonly service: AuditLogService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(AuditLogListQuerySchema)) query: AuditLogListQuery,
  ): Promise<AuditLogListResponse> {
    return this.service.list(query);
  }
}
