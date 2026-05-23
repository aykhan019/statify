import { z } from 'zod';
import { CatalogAlbumSummarySchema, TrackArtistSummarySchema } from './catalog';
import { OffsetPaginationQuerySchema } from './pagination';

export const ListeningSourceSchema = z.enum(['preview', 'seed']);

export const IDEMPOTENCY_KEY_MAX_LENGTH = 128;

export const IdempotencyKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(IDEMPOTENCY_KEY_MAX_LENGTH)
  .regex(/^[A-Za-z0-9_-]+$/);

export const RecordListenRequestSchema = z.object({
  trackId: z.number().int().positive(),
  source: ListeningSourceSchema.default('preview'),
  durationPlayedMs: z.number().int().min(0).max(86_400_000),
  playedAt: z.string().datetime().optional(),
});

export const ListeningHistoryEntrySchema = z.object({
  id: z.number().int(),
  trackId: z.number().int(),
  playedAt: z.string().datetime(),
  source: ListeningSourceSchema,
  durationPlayedMs: z.number().int(),
});

export const RecordListenResponseSchema = z.object({
  entry: ListeningHistoryEntrySchema,
  idempotent: z.boolean(),
});

export const ListeningHistoryListQuerySchema = OffsetPaginationQuerySchema;

export const ListeningHistoryListItemSchema = ListeningHistoryEntrySchema.extend({
  track: z.object({
    id: z.number().int(),
    name: z.string(),
    durationMs: z.number().int(),
    previewUrl: z.string().url().nullable(),
    album: CatalogAlbumSummarySchema,
    artists: z.array(TrackArtistSummarySchema),
  }),
});

export const ListeningHistoryListResponseSchema = z.object({
  data: z.array(ListeningHistoryListItemSchema),
  limit: z.number().int(),
  page: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export const TrackPlayCountResponseSchema = z.object({
  trackId: z.number().int(),
  count: z.number().int(),
});

export type ListeningSource = z.infer<typeof ListeningSourceSchema>;
export type RecordListenRequest = z.infer<typeof RecordListenRequestSchema>;
export type ListeningHistoryEntry = z.infer<typeof ListeningHistoryEntrySchema>;
export type RecordListenResponse = z.infer<typeof RecordListenResponseSchema>;
export type ListeningHistoryListQuery = z.infer<typeof ListeningHistoryListQuerySchema>;
export type ListeningHistoryListItem = z.infer<typeof ListeningHistoryListItemSchema>;
export type ListeningHistoryListResponse = z.infer<typeof ListeningHistoryListResponseSchema>;
export type TrackPlayCountResponse = z.infer<typeof TrackPlayCountResponseSchema>;
