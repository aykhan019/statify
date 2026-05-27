import type {
  DiscoverEntry,
  HeatmapCell,
  HiddenGemEntry,
  SimilarPlaylistEntry,
  TopArtistEntry,
  TopTrackEntry,
  TrendingArtistEntry,
} from '@statify/shared';
import type {
  DiscoverRow,
  HeatmapRow,
  HiddenGemRow,
  SimilarPlaylistRow,
  TopArtistRow,
  TopTrackRow,
  TrendingArtistRow,
} from './analytics.types';

export function toTopArtistEntry(row: TopArtistRow): TopArtistEntry {
  return {
    rank: toNumber(row.rank),
    artistId: row.artist_id,
    artistName: row.artist_name,
    listenCount: toNumber(row.listen_count),
    totalMinutes: toFloat(row.total_minutes),
  };
}

export function toTopTrackEntry(row: TopTrackRow): TopTrackEntry {
  return {
    rank: toNumber(row.rank),
    trackId: row.track_id,
    trackName: row.track_name,
    primaryArtistName: row.primary_artist_name,
    albumName: row.album_name,
    listenCount: toNumber(row.listen_count),
    totalMinutes: toFloat(row.total_minutes),
  };
}

export function toDiscoverEntry(row: DiscoverRow): DiscoverEntry {
  return {
    trackId: row.track_id,
    trackName: row.track_name,
    albumName: row.album_name,
    primaryArtistName: row.primary_artist_name,
    imageUrl: row.image_url,
    cooccurrenceCount: toNumber(row.cooccurrence_count),
  };
}

export function toHeatmapCell(row: HeatmapRow): HeatmapCell {
  return {
    dayOfWeek: row.day_of_week,
    hourOfDay: row.hour_of_day,
    listenCount: toNumber(row.listen_count),
  };
}

export function toTrendingArtistEntry(row: TrendingArtistRow): TrendingArtistEntry {
  return {
    artistId: row.artist_id,
    artistName: row.artist_name,
    recentPlays: toNumber(row.recent_plays),
    priorPlays: toNumber(row.prior_plays),
    growth: toFloat(row.growth),
  };
}

export function toSimilarPlaylistEntry(row: SimilarPlaylistRow): SimilarPlaylistEntry {
  return {
    playlistId: row.playlist_id,
    name: row.name,
    jaccard: toFloat(row.jaccard),
    sharedTracks: toNumber(row.shared_tracks),
  };
}

export function toHiddenGemEntry(row: HiddenGemRow): HiddenGemEntry {
  return {
    trackId: row.track_id,
    trackName: row.track_name,
    albumName: row.album_name,
    primaryArtistName: row.primary_artist_name,
    playlistCount: toNumber(row.playlist_count),
  };
}

function toNumber(value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) : value;
}

function toFloat(value: number | string | { toString(): string }): number {
  return typeof value === 'number' ? value : Number.parseFloat(value.toString());
}
