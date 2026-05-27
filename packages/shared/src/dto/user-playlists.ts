import { z } from 'zod';
import { TrackListItemSchema } from './catalog';
import { OffsetPaginationQuerySchema } from './pagination';

export const USER_PLAYLIST_MAX_TRACKS = 500;

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
  coverImages: z.array(z.string().url()).max(4),
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

export const UpdateUserPlaylistVisibilityRequestSchema = z.object({
  isPublic: z.boolean(),
});

export const UpdateUserPlaylistRequestSchema = z.object({
  name: z.string().trim().min(1).max(USER_PLAYLIST_NAME_MAX),
  description: z.string().trim().max(USER_PLAYLIST_DESCRIPTION_MAX).optional(),
});

export type UpdateUserPlaylistRequest = z.infer<typeof UpdateUserPlaylistRequestSchema>;

export const AddUserPlaylistTrackRequestSchema = z.object({
  trackId: z.number().int().positive(),
});

export const ReorderUserPlaylistTracksRequestSchema = z.object({
  trackIds: z.array(z.number().int().positive()).max(USER_PLAYLIST_MAX_TRACKS),
});

export const UserPlaylistTracksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(USER_PLAYLIST_MAX_TRACKS)
    .default(USER_PLAYLIST_MAX_TRACKS),
});

export const UserPlaylistTrackEntrySchema = z.object({
  pos: z.number().int(),
  addedAt: z.string().datetime(),
  track: TrackListItemSchema,
});

export const UserPlaylistTracksResponseSchema = z.object({
  data: z.array(UserPlaylistTrackEntrySchema),
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
export type UpdateUserPlaylistVisibilityRequest = z.infer<
  typeof UpdateUserPlaylistVisibilityRequestSchema
>;
export type AddUserPlaylistTrackRequest = z.infer<typeof AddUserPlaylistTrackRequestSchema>;
export type ReorderUserPlaylistTracksRequest = z.infer<
  typeof ReorderUserPlaylistTracksRequestSchema
>;
export type UserPlaylistTracksQuery = z.infer<typeof UserPlaylistTracksQuerySchema>;
export type UserPlaylistTrackEntry = z.infer<typeof UserPlaylistTrackEntrySchema>;
export type UserPlaylistTracksResponse = z.infer<typeof UserPlaylistTracksResponseSchema>;
