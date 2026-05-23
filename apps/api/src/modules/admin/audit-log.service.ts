import { Injectable } from '@nestjs/common';
import type {
  AuditLogEntry,
  AuditLogListQuery,
  AuditLogListResponse,
  AuditLogWriteInput,
} from '@statify/shared';
import { toOffsetPage } from '../catalog/catalog.pagination';
import { AuditLogRepository } from './audit-log.repository';
import { toAuditLogEntry } from './audit-log.mapper';

@Injectable()
export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository) {}

  async record(input: AuditLogWriteInput): Promise<AuditLogEntry> {
    const row = await this.repository.create(input);
    return toAuditLogEntry(row);
  }

  async list(query: AuditLogListQuery): Promise<AuditLogListResponse> {
    const result = await this.repository.list(query);
    return toOffsetPage(result.data.map(toAuditLogEntry), result.total, query);
  }
}
