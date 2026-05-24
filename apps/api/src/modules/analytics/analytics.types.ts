export type NumericValue = number | string | { toString(): string };

export interface TopArtistRow {
  rank: number | bigint;
  artist_id: number;
  artist_name: string;
  listen_count: number | bigint;
  total_minutes: NumericValue;
}

export interface TopTrackRow {
  rank: number | bigint;
  track_id: number;
  track_name: string;
  primary_artist_name: string;
  album_name: string;
  listen_count: number | bigint;
  total_minutes: NumericValue;
}

export interface DiscoverRow {
  track_id: number;
  track_name: string;
  album_name: string;
  primary_artist_name: string;
  cooccurrence_count: number | bigint;
}

export interface HeatmapRow {
  day_of_week: number;
  hour_of_day: number;
  listen_count: number | bigint;
}

export interface TrendingArtistRow {
  artist_id: number;
  artist_name: string;
  recent_plays: number | bigint;
  prior_plays: number | bigint;
  growth: NumericValue;
}

export interface SimilarPlaylistRow {
  playlist_id: number;
  name: string;
  jaccard: NumericValue;
  shared_tracks: number | bigint;
}

export interface HiddenGemRow {
  track_id: number;
  track_name: string;
  album_name: string;
  primary_artist_name: string;
  playlist_count: number | bigint;
}
