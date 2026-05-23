import { z } from 'zod';

export const AuditLogActionSchema = z.string().trim().min(1).max(100);

export const AuditLogTargetTableSchema = z.string().trim().min(1).max(63);

export const AuditLogTargetIdSchema = z.string().trim().min(1).max(255);

export const AuditLogMetadataSchema = z.record(z.unknown());

export const AuditLogWriteInputSchema = z.object({
  actorUserId: z.number().int().positive().nullable(),
  action: AuditLogActionSchema,
  targetTable: AuditLogTargetTableSchema,
  targetId: AuditLogTargetIdSchema.nullable(),
  metadata: AuditLogMetadataSchema.nullable(),
});

export const AuditLogEntrySchema = z.object({
  id: z.number().int(),
  actorUserId: z.number().int().nullable(),
  action: z.string(),
  targetTable: z.string(),
  targetId: z.string().nullable(),
  metadata: AuditLogMetadataSchema.nullable(),
  createdAt: z.string().datetime(),
});

export const AdminStatusResponseSchema = z.object({
  user: z.object({
    id: z.number().int(),
    email: z.string().email(),
    displayName: z.string(),
    role: z.literal('admin'),
  }),
});

export type AuditLogWriteInput = z.infer<typeof AuditLogWriteInputSchema>;
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
export type AuditLogMetadata = z.infer<typeof AuditLogMetadataSchema>;
export type AdminStatusResponse = z.infer<typeof AdminStatusResponseSchema>;
