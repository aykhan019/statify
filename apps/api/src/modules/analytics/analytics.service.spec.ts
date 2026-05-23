import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../database/prisma.service';
import { AnalyticsService } from './analytics.service';
import type {
  DiscoverRow,
  HeatmapRow,
  HiddenGemRow,
  SimilarPlaylistRow,
  TopArtistRow,
  TopTrackRow,
  TrendingArtistRow,
} from './analytics.types';

interface RawQueryCall {
  sql: string;
  values: unknown[];
}

function isPrismaSql(value: unknown): value is { sql: string; values: unknown[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { sql?: unknown }).sql === 'string' &&
    Array.isArray((value as { values?: unknown }).values)
  );
}

function createPrisma(rows: unknown[]): { prisma: PrismaService; calls: RawQueryCall[] } {
  const calls: RawQueryCall[] = [];
  const queryRaw = vi.fn((input: unknown) => {
    if (isPrismaSql(input)) {
      calls.push({ sql: input.sql, values: input.values });
    }
    return Promise.resolve(rows);
  });

  return {
    prisma: { $queryRaw: queryRaw } as unknown as PrismaService,
    calls,
  };
}

describe('AnalyticsService', () => {
  describe('topArtists', () => {
    it('parameterizes user id and limit, projects rank, listens, and minutes', async () => {
      const rows: TopArtistRow[] = [
        { rank: 1n, artist_id: 10, artist_name: 'Alpha', listen_count: 5n, total_minutes: '12.50' },
        { rank: 2n, artist_id: 11, artist_name: 'Beta', listen_count: 3, total_minutes: 7.5 },
      ];
      const { prisma, calls } = createPrisma(rows);
      const service = new AnalyticsService(prisma);

      const result = await service.topArtists(7, { limit: 10 });

      expect(result.entries).toEqual([
        { rank: 1, artistId: 10, artistName: 'Alpha', listenCount: 5, totalMinutes: 12.5 },
        { rank: 2, artistId: 11, artistName: 'Beta', listenCount: 3, totalMinutes: 7.5 },
      ]);
      expect(calls[0]?.sql).toContain('DENSE_RANK()');
      expect(calls[0]?.sql).toContain('HAVING COUNT(*) > 1');
      expect(calls[0]?.values).toEqual([7, 10]);
    });
  });

  describe('topTracks', () => {
    it('parameterizes user id and limit, projects rank, listens, minutes, artist, album', async () => {
      const rows: TopTrackRow[] = [
        {
          rank: 1n,
          track_id: 100,
          track_name: 'Track A',
          primary_artist_name: 'Artist A',
          album_name: 'Album A',
          listen_count: 9n,
          total_minutes: '22.50',
        },
      ];
      const { prisma, calls } = createPrisma(rows);
      const service = new AnalyticsService(prisma);

      const result = await service.topTracks(7, { limit: 10 });

      expect(result.entries).toEqual([
        {
          rank: 1,
          trackId: 100,
          trackName: 'Track A',
          primaryArtistName: 'Artist A',
          albumName: 'Album A',
          listenCount: 9,
          totalMinutes: 22.5,
        },
      ]);
      expect(calls[0]?.sql).toContain('DENSE_RANK()');
      expect(calls[0]?.sql).toContain('FROM listening_history lh');
      expect(calls[0]?.values).toEqual([7, 10]);
    });
  });

  describe('discover', () => {
    it('binds user id twice and excludes already heard tracks via NOT EXISTS', async () => {
      const rows: DiscoverRow[] = [
        {
          track_id: 100,
          track_name: 'Track A',
          album_name: 'Album A',
          primary_artist_name: 'Artist A',
          cooccurrence_count: 8,
        },
      ];
      const { prisma, calls } = createPrisma(rows);
      const service = new AnalyticsService(prisma);

      const result = await service.discover(7, { limit: 20 });

      expect(result.entries).toEqual([
        {
          trackId: 100,
          trackName: 'Track A',
          albumName: 'Album A',
          primaryArtistName: 'Artist A',
          cooccurrenceCount: 8,
        },
      ]);
      expect(calls[0]?.sql).toContain('NOT EXISTS');
      expect(calls[0]?.values).toEqual([7, 7, 20]);
    });
  });

  describe('heatmap', () => {
    it('groups by extracted day-of-week and hour-of-day', async () => {
      const rows: HeatmapRow[] = [
        { day_of_week: 1, hour_of_day: 9, listen_count: 4n },
        { day_of_week: 5, hour_of_day: 22, listen_count: 11 },
      ];
      const { prisma, calls } = createPrisma(rows);
      const service = new AnalyticsService(prisma);

      const result = await service.heatmap(7);

      expect(result.cells).toEqual([
        { dayOfWeek: 1, hourOfDay: 9, listenCount: 4 },
        { dayOfWeek: 5, hourOfDay: 22, listenCount: 11 },
      ]);
      expect(calls[0]?.sql).toContain('EXTRACT(DOW');
      expect(calls[0]?.sql).toContain('EXTRACT(HOUR');
      expect(calls[0]?.values).toEqual([7]);
    });
  });

  describe('trending', () => {
    it('uses recent and prior CTEs and filters by growth threshold', async () => {
      const rows: TrendingArtistRow[] = [
        {
          artist_id: 20,
          artist_name: 'Gamma',
          recent_plays: 10,
          prior_plays: 4,
          growth: '1.5000',
        },
      ];
      const { prisma, calls } = createPrisma(rows);
      const service = new AnalyticsService(prisma);

      const result = await service.trending(7, { limit: 10, growthThreshold: 0.25 });

      expect(result.entries).toEqual([
        {
          artistId: 20,
          artistName: 'Gamma',
          recentPlays: 10,
          priorPlays: 4,
          growth: 1.5,
        },
      ]);
      expect(calls[0]?.sql).toContain('WITH recent');
      expect(calls[0]?.sql).toContain('LEFT JOIN prior');
      expect(calls[0]?.sql).toContain("INTERVAL '7 days'");
      expect(calls[0]?.sql).toContain("INTERVAL '14 days'");
      expect(calls[0]?.values).toEqual([7, 7, 0.25, 10]);
    });
  });

  describe('similarPlaylists', () => {
    it('computes Jaccard similarity and filters out the source playlist', async () => {
      const rows: SimilarPlaylistRow[] = [
        { playlist_id: 200, name: 'Mix B', jaccard: '0.3750', shared_tracks: 3 },
      ];
      const { prisma, calls } = createPrisma(rows);
      const service = new AnalyticsService(prisma);

      const result = await service.similarPlaylists(42, { limit: 10 });

      expect(result.entries).toEqual([
        { playlistId: 200, name: 'Mix B', jaccard: 0.375, sharedTracks: 3 },
      ]);
      expect(calls[0]?.sql).toContain('WITH source');
      expect(calls[0]?.sql).toContain('UNION');
      expect(calls[0]?.values).toEqual([42, 42, 10]);
    });
  });

  describe('hiddenGems', () => {
    it('returns tracks in many playlists with no listening history', async () => {
      const rows: HiddenGemRow[] = [
        {
          track_id: 300,
          track_name: 'Track Z',
          album_name: 'Album Z',
          primary_artist_name: 'Artist Z',
          playlist_count: 12n,
        },
      ];
      const { prisma, calls } = createPrisma(rows);
      const service = new AnalyticsService(prisma);

      const result = await service.hiddenGems({ limit: 20, minPlaylistCount: 3 });

      expect(result.entries).toEqual([
        {
          trackId: 300,
          trackName: 'Track Z',
          albumName: 'Album Z',
          primaryArtistName: 'Artist Z',
          playlistCount: 12,
        },
      ]);
      expect(calls[0]?.sql).toContain('LEFT JOIN listening_history');
      expect(calls[0]?.sql).toContain('WHERE lh.id IS NULL');
      expect(calls[0]?.values).toEqual([3, 20]);
    });
  });
});
