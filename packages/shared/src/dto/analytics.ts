import { z } from 'zod';

const OptionalLimitSchema = (max: number, fallback: number) =>
  z.coerce.number().int().min(1).max(max).default(fallback);

export const TopArtistsQuerySchema = z.object({
  limit: OptionalLimitSchema(50, 10),
});

export const TopArtistEntrySchema = z.object({
  rank: z.number().int(),
  artistId: z.number().int(),
  artistName: z.string(),
  listenCount: z.number().int(),
  totalMinutes: z.number(),
});

export const TopArtistsResponseSchema = z.object({
  entries: z.array(TopArtistEntrySchema),
});

export const TopTracksQuerySchema = z.object({
  limit: OptionalLimitSchema(50, 10),
});

export const TopTrackEntrySchema = z.object({
  rank: z.number().int(),
  trackId: z.number().int(),
  trackName: z.string(),
  primaryArtistName: z.string(),
  albumName: z.string(),
  listenCount: z.number().int(),
  totalMinutes: z.number(),
});

export const TopTracksResponseSchema = z.object({
  entries: z.array(TopTrackEntrySchema),
});

export const DiscoverQuerySchema = z.object({
  limit: OptionalLimitSchema(50, 20),
});

export const DiscoverEntrySchema = z.object({
  trackId: z.number().int(),
  trackName: z.string(),
  albumName: z.string(),
  primaryArtistName: z.string(),
  imageUrl: z.string().url().nullable(),
  cooccurrenceCount: z.number().int(),
});

export const DiscoverResponseSchema = z.object({
  entries: z.array(DiscoverEntrySchema),
});

export const HEATMAP_DAYS = 7;
export const HEATMAP_HOURS = 24;

export const HeatmapCellSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  hourOfDay: z.number().int().min(0).max(23),
  listenCount: z.number().int(),
});

export const HeatmapResponseSchema = z.object({
  cells: z.array(HeatmapCellSchema),
});

export const TrendingQuerySchema = z.object({
  limit: OptionalLimitSchema(50, 10),
  growthThreshold: z.coerce.number().min(0).default(0.25),
});

export const TrendingArtistEntrySchema = z.object({
  artistId: z.number().int(),
  artistName: z.string(),
  recentPlays: z.number().int(),
  priorPlays: z.number().int(),
  growth: z.number(),
});

export const TrendingResponseSchema = z.object({
  entries: z.array(TrendingArtistEntrySchema),
});

export const SimilarPlaylistsQuerySchema = z.object({
  limit: OptionalLimitSchema(50, 10),
});

export const SimilarPlaylistEntrySchema = z.object({
  playlistId: z.number().int(),
  name: z.string(),
  jaccard: z.number(),
  sharedTracks: z.number().int(),
});

export const SimilarPlaylistsResponseSchema = z.object({
  entries: z.array(SimilarPlaylistEntrySchema),
});

export const HiddenGemsQuerySchema = z.object({
  limit: OptionalLimitSchema(50, 20),
  minPlaylistCount: z.coerce.number().int().min(1).default(3),
});

export const HiddenGemEntrySchema = z.object({
  trackId: z.number().int(),
  trackName: z.string(),
  albumName: z.string(),
  primaryArtistName: z.string(),
  playlistCount: z.number().int(),
});

export const HiddenGemsResponseSchema = z.object({
  entries: z.array(HiddenGemEntrySchema),
});

export type TopArtistsQuery = z.infer<typeof TopArtistsQuerySchema>;
export type TopArtistEntry = z.infer<typeof TopArtistEntrySchema>;
export type TopArtistsResponse = z.infer<typeof TopArtistsResponseSchema>;
export type TopTracksQuery = z.infer<typeof TopTracksQuerySchema>;
export type TopTrackEntry = z.infer<typeof TopTrackEntrySchema>;
export type TopTracksResponse = z.infer<typeof TopTracksResponseSchema>;
export type DiscoverQuery = z.infer<typeof DiscoverQuerySchema>;
export type DiscoverEntry = z.infer<typeof DiscoverEntrySchema>;
export type DiscoverResponse = z.infer<typeof DiscoverResponseSchema>;
export type HeatmapCell = z.infer<typeof HeatmapCellSchema>;
export type HeatmapResponse = z.infer<typeof HeatmapResponseSchema>;
export type TrendingQuery = z.infer<typeof TrendingQuerySchema>;
export type TrendingArtistEntry = z.infer<typeof TrendingArtistEntrySchema>;
export type TrendingResponse = z.infer<typeof TrendingResponseSchema>;
export type SimilarPlaylistsQuery = z.infer<typeof SimilarPlaylistsQuerySchema>;
export type SimilarPlaylistEntry = z.infer<typeof SimilarPlaylistEntrySchema>;
export type SimilarPlaylistsResponse = z.infer<typeof SimilarPlaylistsResponseSchema>;
export type HiddenGemsQuery = z.infer<typeof HiddenGemsQuerySchema>;
export type HiddenGemEntry = z.infer<typeof HiddenGemEntrySchema>;
export type HiddenGemsResponse = z.infer<typeof HiddenGemsResponseSchema>;
