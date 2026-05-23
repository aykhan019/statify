import type { AuditLog, Prisma } from '@prisma/client';
import type { AuditLogEntry, AuditLogMetadata } from '@statify/shared';

export function toAuditLogEntry(row: AuditLog): AuditLogEntry {
  return {
    id: row.id,
    actorUserId: row.actorUserId,
    action: row.action,
    targetTable: row.targetTable,
    targetId: row.targetId,
    metadata: toMetadata(row.metadata),
    createdAt: row.createdAt.toISOString(),
  };
}

function toMetadata(value: Prisma.JsonValue | null): AuditLogMetadata | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as AuditLogMetadata;
}
