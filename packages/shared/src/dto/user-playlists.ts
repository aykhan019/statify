import { z } from 'zod';
import { OffsetPaginationQuerySchema } from './pagination';

export const USER_PLAYLIST_NAME_MAX = 120;
export const USER_PLAYLIST_DESCRIPTION_MAX = 1000;

export const CreateUserPlaylistRequestSchema = z.object({
  name: z.string().trim().min(1).max(USER_PLAYLIST_NAME_MAX),
  description: z.string().trim().max(USER_PLAYLIST_DESCRIPTION_MAX).optional(),
  isPublic: z.boolean().default(false),
});

export const UserPlaylistsListQuerySchema = OffsetPaginationQuerySchema.extend({
  q: z.string().trim().min(1).max(100).optional(),
});

export const UserPlaylistOwnerSchema = z.object({
  id: z.number().int(),
  displayName: z.string(),
});

export const UserPlaylistListItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  trackCount: z.number().int(),
  owner: UserPlaylistOwnerSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserPlaylistDetailSchema = UserPlaylistListItemSchema;

export const UserPlaylistListResponseSchema = z.object({
  data: z.array(UserPlaylistListItemSchema),
  limit: z.number().int(),
  page: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export type CreateUserPlaylistRequest = z.infer<typeof CreateUserPlaylistRequestSchema>;
export type UserPlaylistsListQuery = z.infer<typeof UserPlaylistsListQuerySchema>;
export type UserPlaylistOwner = z.infer<typeof UserPlaylistOwnerSchema>;
export type UserPlaylistListItem = z.infer<typeof UserPlaylistListItemSchema>;
export type UserPlaylistDetail = z.infer<typeof UserPlaylistDetailSchema>;
export type UserPlaylistListResponse = z.infer<typeof UserPlaylistListResponseSchema>;
