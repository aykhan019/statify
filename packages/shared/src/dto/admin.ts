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
