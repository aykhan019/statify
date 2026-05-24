import { z } from 'zod';
import { OffsetPaginationQuerySchema } from './pagination';
import { TrackListItemSchema } from './catalog';

export const MpdPlaylistSortSchema = z
  .enum(['name', '-name', 'numFollowers', '-numFollowers'])
  .default('-numFollowers');

export const MpdPlaylistsQuerySchema = OffsetPaginationQuerySchema.extend({
  q: z.string().trim().min(1).max(100).optional(),
  sort: MpdPlaylistSortSchema,
});

export const MpdPlaylistTracksQuerySchema = OffsetPaginationQuerySchema;

export const MpdPlaylistListItemSchema = z.object({
  collaborative: z.boolean(),
  coverImages: z.array(z.string().url()).max(4),
  durationMs: z.number().int(),
  id: z.number().int(),
  mpdPid: z.number().int(),
  name: z.string(),
  numEdits: z.number().int(),
  numFollowers: z.number().int(),
  trackCount: z.number().int(),
});

export const MpdPlaylistDetailSchema = MpdPlaylistListItemSchema.extend({
  modifiedAt: z.string().datetime(),
});

export const MpdPlaylistTrackEntrySchema = z.object({
  pos: z.number().int(),
  track: TrackListItemSchema,
});

export const MpdPlaylistListResponseSchema = z.object({
  data: z.array(MpdPlaylistListItemSchema),
  limit: z.number().int(),
  page: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export const MpdPlaylistTracksResponseSchema = z.object({
  data: z.array(MpdPlaylistTrackEntrySchema),
  limit: z.number().int(),
  page: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export type MpdPlaylistSort = z.infer<typeof MpdPlaylistSortSchema>;
export type MpdPlaylistsQuery = z.infer<typeof MpdPlaylistsQuerySchema>;
export type MpdPlaylistTracksQuery = z.infer<typeof MpdPlaylistTracksQuerySchema>;
export type MpdPlaylistListItem = z.infer<typeof MpdPlaylistListItemSchema>;
export type MpdPlaylistDetail = z.infer<typeof MpdPlaylistDetailSchema>;
export type MpdPlaylistTrackEntry = z.infer<typeof MpdPlaylistTrackEntrySchema>;
export type MpdPlaylistListResponse = z.infer<typeof MpdPlaylistListResponseSchema>;
export type MpdPlaylistTracksResponse = z.infer<typeof MpdPlaylistTracksResponseSchema>;
