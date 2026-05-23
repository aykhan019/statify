import { z } from 'zod';
import { UserRoleSchema } from './auth';
import { OffsetPaginationQuerySchema } from './pagination';

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

export const AuditLogListQuerySchema = OffsetPaginationQuerySchema.extend({
  action: z.string().trim().min(1).max(100).optional(),
  actorUserId: z.coerce.number().int().positive().optional(),
  targetTable: z.string().trim().min(1).max(63).optional(),
});

export const AuditLogListResponseSchema = z.object({
  data: z.array(AuditLogEntrySchema),
  limit: z.number().int(),
  page: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
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
export type AuditLogListQuery = z.infer<typeof AuditLogListQuerySchema>;
export type AuditLogListResponse = z.infer<typeof AuditLogListResponseSchema>;

export const AdminUserListItemSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  displayName: z.string(),
  role: UserRoleSchema,
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
  bannedAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable(),
});

export const AdminUsersListQuerySchema = OffsetPaginationQuerySchema.extend({
  q: z.string().trim().min(1).max(100).optional(),
});

export const AdminUserListResponseSchema = z.object({
  data: z.array(AdminUserListItemSchema),
  limit: z.number().int(),
  page: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export const UpdateUserRoleRequestSchema = z.object({
  role: UserRoleSchema,
});

export const UpdateUserBanRequestSchema = z.object({
  banned: z.boolean(),
});

export type AdminUserListItem = z.infer<typeof AdminUserListItemSchema>;
export type AdminUsersListQuery = z.infer<typeof AdminUsersListQuerySchema>;
export type AdminUserListResponse = z.infer<typeof AdminUserListResponseSchema>;
export type UpdateUserRoleRequest = z.infer<typeof UpdateUserRoleRequestSchema>;
export type UpdateUserBanRequest = z.infer<typeof UpdateUserBanRequestSchema>;

export const IngestCheckpointSchema = z.object({
  id: z.number().int(),
  sliceFilename: z.string(),
  playlistsTotal: z.number().int(),
  playlistsDone: z.number().int(),
  artistsUpserted: z.number().int(),
  albumsUpserted: z.number().int(),
  tracksUpserted: z.number().int(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  errorMessage: z.string().nullable(),
});

export const IngestRunsListResponseSchema = z.object({
  data: z.array(IngestCheckpointSchema),
  running: z.boolean(),
  startedAt: z.string().datetime().nullable(),
});

export const TriggerIngestRunRequestSchema = z.object({
  dataDir: z.string().trim().min(1).max(255).optional(),
  slices: z.number().int().min(1).max(50).optional(),
  resume: z.boolean().default(true),
  batchSize: z.number().int().min(1).max(5000).optional(),
});

export const TriggerIngestRunResponseSchema = z.object({
  accepted: z.boolean(),
  message: z.string(),
});

export type IngestCheckpoint = z.infer<typeof IngestCheckpointSchema>;
export type IngestRunsListResponse = z.infer<typeof IngestRunsListResponseSchema>;
export type TriggerIngestRunRequest = z.infer<typeof TriggerIngestRunRequestSchema>;
export type TriggerIngestRunResponse = z.infer<typeof TriggerIngestRunResponseSchema>;
