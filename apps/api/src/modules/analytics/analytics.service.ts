import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  DiscoverQuery,
  DiscoverResponse,
  HeatmapResponse,
  HiddenGemsQuery,
  HiddenGemsResponse,
  SimilarPlaylistsQuery,
  SimilarPlaylistsResponse,
  TopArtistsQuery,
  TopArtistsResponse,
  TopTracksQuery,
  TopTracksResponse,
  TrendingQuery,
  TrendingResponse,
} from '@statify/shared';
import { PrismaService } from '../../database/prisma.service';
import {
  toDiscoverEntry,
  toHeatmapCell,
  toHiddenGemEntry,
  toSimilarPlaylistEntry,
  toTopArtistEntry,
  toTopTrackEntry,
  toTrendingArtistEntry,
} from './analytics.mapper';
import type {
  DiscoverRow,
  HeatmapRow,
  HiddenGemRow,
  SimilarPlaylistRow,
  TopArtistRow,
  TopTrackRow,
  TrendingArtistRow,
} from './analytics.types';

const TRENDING_WINDOW_DAYS = 7;

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async topArtists(userId: number, query: TopArtistsQuery): Promise<TopArtistsResponse> {
    const rows = await this.prisma.$queryRaw<TopArtistRow[]>(Prisma.sql`
      SELECT
        DENSE_RANK() OVER (ORDER BY COUNT(*) DESC, SUM(lh.duration_played_ms) DESC) AS rank,
        a.id AS artist_id,
        a.name AS artist_name,
        COUNT(*)::int AS listen_count,
        ROUND(SUM(lh.duration_played_ms)::numeric / 60000.0, 2) AS total_minutes
      FROM listening_history lh
      JOIN tracks t ON t.id = lh.track_id
      JOIN track_artists ta ON ta.track_id = t.id
      JOIN artists a ON a.id = ta.artist_id
      WHERE lh.user_id = ${userId}
      GROUP BY a.id, a.name
      HAVING COUNT(*) > 1
      ORDER BY rank ASC, artist_name ASC
      LIMIT ${query.limit}
    `);

    return { entries: rows.map(toTopArtistEntry) };
  }

  async topTracks(userId: number, query: TopTracksQuery): Promise<TopTracksResponse> {
    const rows = await this.prisma.$queryRaw<TopTrackRow[]>(Prisma.sql`
      SELECT
        DENSE_RANK() OVER (ORDER BY COUNT(*) DESC, SUM(lh.duration_played_ms) DESC) AS rank,
        t.id AS track_id,
        t.name AS track_name,
        pa.name AS primary_artist_name,
        al.name AS album_name,
        COUNT(*)::int AS listen_count,
        ROUND(SUM(lh.duration_played_ms)::numeric / 60000.0, 2) AS total_minutes
      FROM listening_history lh
      JOIN tracks t ON t.id = lh.track_id
      JOIN albums al ON al.id = t.album_id
      JOIN artists pa ON pa.id = al.primary_artist_id
      WHERE lh.user_id = ${userId}
      GROUP BY t.id, t.name, pa.name, al.name
      ORDER BY rank ASC, track_name ASC
      LIMIT ${query.limit}
    `);

    return { entries: rows.map(toTopTrackEntry) };
  }

  async discover(userId: number, query: DiscoverQuery): Promise<DiscoverResponse> {
    const rows = await this.prisma.$queryRaw<DiscoverRow[]>(Prisma.sql`
      WITH top_track AS (
        SELECT lh.track_id
        FROM listening_history lh
        WHERE lh.user_id = ${userId}
        GROUP BY lh.track_id
        ORDER BY COUNT(*) DESC, lh.track_id ASC
        LIMIT 1
      ),
      cohort_playlists AS (
        SELECT DISTINCT mpt.playlist_id
        FROM mpd_playlist_tracks mpt
        WHERE mpt.track_id = (SELECT track_id FROM top_track)
      )
      SELECT
        t.id AS track_id,
        t.name AS track_name,
        al.name AS album_name,
        pa.name AS primary_artist_name,
        COUNT(*)::int AS cooccurrence_count
      FROM mpd_playlist_tracks mpt
      JOIN tracks t ON t.id = mpt.track_id
      JOIN albums al ON al.id = t.album_id
      JOIN artists pa ON pa.id = al.primary_artist_id
      WHERE mpt.playlist_id IN (SELECT playlist_id FROM cohort_playlists)
        AND mpt.track_id <> (SELECT track_id FROM top_track)
        AND NOT EXISTS (
          SELECT 1 FROM listening_history lh
          WHERE lh.user_id = ${userId} AND lh.track_id = t.id
        )
      GROUP BY t.id, t.name, al.name, pa.name
      ORDER BY cooccurrence_count DESC, track_name ASC
      LIMIT ${query.limit}
    `);

    return { entries: rows.map(toDiscoverEntry) };
  }

  async heatmap(userId: number): Promise<HeatmapResponse> {
    const rows = await this.prisma.$queryRaw<HeatmapRow[]>(Prisma.sql`
      SELECT
        EXTRACT(DOW FROM lh.played_at)::int AS day_of_week,
        EXTRACT(HOUR FROM lh.played_at)::int AS hour_of_day,
        COUNT(*)::int AS listen_count
      FROM listening_history lh
      WHERE lh.user_id = ${userId}
      GROUP BY day_of_week, hour_of_day
      ORDER BY day_of_week ASC, hour_of_day ASC
    `);

    return { cells: rows.map(toHeatmapCell) };
  }

  async trending(userId: number, query: TrendingQuery): Promise<TrendingResponse> {
    const rows = await this.prisma.$queryRaw<TrendingArtistRow[]>(Prisma.sql`
      WITH recent AS (
        SELECT a.id AS artist_id, a.name AS artist_name, COUNT(*)::int AS plays
        FROM listening_history lh
        JOIN track_artists ta ON ta.track_id = lh.track_id
        JOIN artists a ON a.id = ta.artist_id
        WHERE lh.user_id = ${userId}
          AND lh.played_at >= NOW() - INTERVAL '${Prisma.raw(String(TRENDING_WINDOW_DAYS))} days'
        GROUP BY a.id, a.name
      ),
      prior AS (
        SELECT a.id AS artist_id, COUNT(*)::int AS plays
        FROM listening_history lh
        JOIN track_artists ta ON ta.track_id = lh.track_id
        JOIN artists a ON a.id = ta.artist_id
        WHERE lh.user_id = ${userId}
          AND lh.played_at >= NOW() - INTERVAL '${Prisma.raw(String(TRENDING_WINDOW_DAYS * 2))} days'
          AND lh.played_at < NOW() - INTERVAL '${Prisma.raw(String(TRENDING_WINDOW_DAYS))} days'
        GROUP BY a.id
      )
      SELECT
        recent.artist_id,
        recent.artist_name,
        recent.plays AS recent_plays,
        COALESCE(prior.plays, 0) AS prior_plays,
        CASE
          WHEN COALESCE(prior.plays, 0) = 0 THEN recent.plays::numeric
          ELSE ROUND((recent.plays - prior.plays)::numeric / prior.plays::numeric, 4)
        END AS growth
      FROM recent
      LEFT JOIN prior ON prior.artist_id = recent.artist_id
      WHERE
        CASE
          WHEN COALESCE(prior.plays, 0) = 0 THEN recent.plays::numeric
          ELSE (recent.plays - prior.plays)::numeric / prior.plays::numeric
        END >= ${query.growthThreshold}
      ORDER BY growth DESC, recent_plays DESC, artist_name ASC
      LIMIT ${query.limit}
    `);

    return { entries: rows.map(toTrendingArtistEntry) };
  }

  async similarPlaylists(
    playlistId: number,
    query: SimilarPlaylistsQuery,
  ): Promise<SimilarPlaylistsResponse> {
    const rows = await this.prisma.$queryRaw<SimilarPlaylistRow[]>(Prisma.sql`
      WITH source AS (
        SELECT track_id FROM mpd_playlist_tracks WHERE playlist_id = ${playlistId}
      )
      SELECT
        mp.id AS playlist_id,
        mp.name,
        ROUND(
          COUNT(*) FILTER (WHERE other.track_id IN (SELECT track_id FROM source))::numeric
          / NULLIF((
            SELECT COUNT(*) FROM (
              SELECT track_id FROM source
              UNION
              SELECT track_id FROM mpd_playlist_tracks WHERE playlist_id = mp.id
            ) u
          ), 0)::numeric,
          4
        ) AS jaccard,
        COUNT(*) FILTER (WHERE other.track_id IN (SELECT track_id FROM source))::int AS shared_tracks
      FROM mpd_playlists mp
      JOIN mpd_playlist_tracks other ON other.playlist_id = mp.id
      WHERE mp.id <> ${playlistId}
      GROUP BY mp.id, mp.name
      HAVING COUNT(*) FILTER (WHERE other.track_id IN (SELECT track_id FROM source)) > 0
      ORDER BY jaccard DESC, shared_tracks DESC, mp.name ASC
      LIMIT ${query.limit}
    `);

    return { entries: rows.map(toSimilarPlaylistEntry) };
  }

  async hiddenGems(query: HiddenGemsQuery): Promise<HiddenGemsResponse> {
    const rows = await this.prisma.$queryRaw<HiddenGemRow[]>(Prisma.sql`
      SELECT
        t.id AS track_id,
        t.name AS track_name,
        al.name AS album_name,
        pa.name AS primary_artist_name,
        COUNT(DISTINCT mpt.playlist_id)::int AS playlist_count
      FROM tracks t
      JOIN albums al ON al.id = t.album_id
      JOIN artists pa ON pa.id = al.primary_artist_id
      JOIN mpd_playlist_tracks mpt ON mpt.track_id = t.id
      LEFT JOIN listening_history lh ON lh.track_id = t.id
      WHERE lh.id IS NULL
      GROUP BY t.id, t.name, al.name, pa.name
      HAVING COUNT(DISTINCT mpt.playlist_id) >= ${query.minPlaylistCount}
      ORDER BY playlist_count DESC, track_name ASC
      LIMIT ${query.limit}
    `);

    return { entries: rows.map(toHiddenGemEntry) };
  }
}
