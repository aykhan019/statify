import { z } from 'zod';
import { OffsetPaginationQuerySchema } from './pagination';

const OptionalSearchQuerySchema = z.string().trim().min(1).max(100).optional();

const OptionalPositiveIntSchema = z.coerce.number().int().positive().optional();

const OptionalNonNegativeIntSchema = z.coerce.number().int().nonnegative().optional();

const SearchLimitSchema = z.coerce.number().int().min(1).max(10).default(5);

const OptionalBooleanQuerySchema = z
  .preprocess((value) => {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return value;
  }, z.boolean())
  .optional();

export const TrackSortSchema = z
  .enum(['name', '-name', 'durationMs', '-durationMs'])
  .default('name');
export const ArtistSortSchema = z
  .enum(['name', '-name', 'createdAt', '-createdAt'])
  .default('name');
export const AlbumSortSchema = z.enum(['name', '-name', 'createdAt', '-createdAt']).default('name');

export const TracksQuerySchema = OffsetPaginationQuerySchema.extend({
  albumId: OptionalPositiveIntSchema,
  artistId: OptionalPositiveIntSchema,
  hasPreview: OptionalBooleanQuerySchema,
  maxDurationMs: OptionalNonNegativeIntSchema,
  minDurationMs: OptionalNonNegativeIntSchema,
  q: OptionalSearchQuerySchema,
  sort: TrackSortSchema,
}).refine(
  (query) =>
    query.minDurationMs === undefined ||
    query.maxDurationMs === undefined ||
    query.minDurationMs <= query.maxDurationMs,
  {
    message: 'Minimum duration must be less than or equal to maximum duration',
    path: ['minDurationMs'],
  },
);

export const ArtistsQuerySchema = OffsetPaginationQuerySchema.extend({
  q: OptionalSearchQuerySchema,
  sort: ArtistSortSchema,
});

export const AlbumsQuerySchema = OffsetPaginationQuerySchema.extend({
  artistId: OptionalPositiveIntSchema,
  q: OptionalSearchQuerySchema,
  sort: AlbumSortSchema,
});

export const CatalogSearchQuerySchema = z.object({
  limit: SearchLimitSchema,
  q: z.string().trim().min(2).max(100),
});

export const CatalogArtistSummarySchema = z.object({
  id: z.number().int(),
  imageUrl: z.string().url().nullable(),
  name: z.string(),
  spotifyUri: z.string(),
});

export const CatalogAlbumSummarySchema = z.object({
  id: z.number().int(),
  imageUrl: z.string().url().nullable(),
  name: z.string(),
  primaryArtist: CatalogArtistSummarySchema,
  spotifyUri: z.string(),
});

export const TrackArtistSummarySchema = CatalogArtistSummarySchema.extend({
  role: z.enum(['primary', 'featured']),
});

export const TrackListItemSchema = z.object({
  album: CatalogAlbumSummarySchema,
  artists: z.array(TrackArtistSummarySchema),
  durationMs: z.number().int(),
  id: z.number().int(),
  imageUrl: z.string().url().nullable(),
  name: z.string(),
  previewUrl: z.string().url().nullable(),
  spotifyUri: z.string(),
});

export const ArtistListItemSchema = CatalogArtistSummarySchema;

export const AlbumListItemSchema = CatalogAlbumSummarySchema;

export const TrackDetailSchema = TrackListItemSchema.extend({
  previewFetchedAt: z.string().datetime().nullable(),
});

export const ArtistDetailSchema = CatalogArtistSummarySchema.extend({
  albumCount: z.number().int(),
  createdAt: z.string().datetime(),
  trackCount: z.number().int(),
});

export const AlbumDetailSchema = CatalogAlbumSummarySchema.extend({
  createdAt: z.string().datetime(),
  trackCount: z.number().int(),
});

export const CatalogSearchTrackResultSchema = z.object({
  albumName: z.string(),
  id: z.number().int(),
  imageUrl: z.string().url().nullable(),
  name: z.string(),
  primaryArtistName: z.string(),
  score: z.number(),
});

export const CatalogSearchArtistResultSchema = z.object({
  id: z.number().int(),
  imageUrl: z.string().url().nullable(),
  name: z.string(),
  score: z.number(),
  trackCount: z.number().int(),
});

export const CatalogSearchAlbumResultSchema = z.object({
  id: z.number().int(),
  imageUrl: z.string().url().nullable(),
  name: z.string(),
  primaryArtistName: z.string(),
  score: z.number(),
});

export const CatalogSearchResponseSchema = z.object({
  albums: z.array(CatalogSearchAlbumResultSchema),
  artists: z.array(CatalogSearchArtistResultSchema),
  tracks: z.array(CatalogSearchTrackResultSchema),
});

export const TrackListResponseSchema = createOffsetPageSchema(TrackListItemSchema);
export const ArtistListResponseSchema = createOffsetPageSchema(ArtistListItemSchema);
export const AlbumListResponseSchema = createOffsetPageSchema(AlbumListItemSchema);

export type TrackSort = z.infer<typeof TrackSortSchema>;
export type ArtistSort = z.infer<typeof ArtistSortSchema>;
export type AlbumSort = z.infer<typeof AlbumSortSchema>;
export type TracksQuery = z.infer<typeof TracksQuerySchema>;
export type ArtistsQuery = z.infer<typeof ArtistsQuerySchema>;
export type AlbumsQuery = z.infer<typeof AlbumsQuerySchema>;
export type CatalogSearchQuery = z.infer<typeof CatalogSearchQuerySchema>;
export type CatalogArtistSummary = z.infer<typeof CatalogArtistSummarySchema>;
export type CatalogAlbumSummary = z.infer<typeof CatalogAlbumSummarySchema>;
export type TrackArtistSummary = z.infer<typeof TrackArtistSummarySchema>;
export type TrackListItem = z.infer<typeof TrackListItemSchema>;
export type ArtistListItem = z.infer<typeof ArtistListItemSchema>;
export type AlbumListItem = z.infer<typeof AlbumListItemSchema>;
export type TrackDetail = z.infer<typeof TrackDetailSchema>;
export type ArtistDetail = z.infer<typeof ArtistDetailSchema>;
export type AlbumDetail = z.infer<typeof AlbumDetailSchema>;
export type TrackListResponse = z.infer<typeof TrackListResponseSchema>;
export type ArtistListResponse = z.infer<typeof ArtistListResponseSchema>;
export type AlbumListResponse = z.infer<typeof AlbumListResponseSchema>;
export type CatalogSearchTrackResult = z.infer<typeof CatalogSearchTrackResultSchema>;
export type CatalogSearchArtistResult = z.infer<typeof CatalogSearchArtistResultSchema>;
export type CatalogSearchAlbumResult = z.infer<typeof CatalogSearchAlbumResultSchema>;
export type CatalogSearchResponse = z.infer<typeof CatalogSearchResponseSchema>;

function createOffsetPageSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    limit: z.number().int(),
    page: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  });
}
