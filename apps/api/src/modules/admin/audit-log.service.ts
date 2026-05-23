import { Injectable } from '@nestjs/common';
import type { AuditLogEntry, AuditLogWriteInput } from '@statify/shared';
import { AuditLogRepository } from './audit-log.repository';
import { toAuditLogEntry } from './audit-log.mapper';

@Injectable()
export class AuditLogService {
  constructor(private readonly repository: AuditLogRepository) {}

  async record(input: AuditLogWriteInput): Promise<AuditLogEntry> {
    const row = await this.repository.create(input);
    return toAuditLogEntry(row);
  }
}
