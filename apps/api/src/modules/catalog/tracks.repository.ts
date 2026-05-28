import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { TrackSort, TracksQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from './catalog.pagination';
import type { CatalogListResult } from './catalog.types';

const TRACK_CATALOG_INCLUDE = {
  album: {
    include: {
      primaryArtist: true,
    },
  },
  trackArtists: {
    include: {
      artist: true,
    },
    orderBy: {
      artistId: 'asc',
    },
  },
} as const satisfies Prisma.TrackInclude;

export type TrackCatalogRecord = Prisma.TrackGetPayload<{
  include: typeof TRACK_CATALOG_INCLUDE;
}>;

// `plays` (raw aggregation) and `name` (friendly raw ordering) are handled separately; the
// remaining sorts map directly to Prisma orderBy.
type TrackPrismaSort = Exclude<TrackSort, 'plays' | '-plays' | 'name'>;

const TRACK_ORDER_BY: Record<TrackPrismaSort, Prisma.TrackOrderByWithRelationInput[]> = {
  '-durationMs': [{ durationMs: 'desc' }, { id: 'asc' }],
  '-name': [{ name: 'desc' }, { id: 'asc' }],
  durationMs: [{ durationMs: 'asc' }, { id: 'asc' }],
};

// Name ordering for the `name` sort and as a tie-break: letters (A-Z) first, then digits, then
// punctuation/symbols, alphabetical within each group.
const TRACK_FRIENDLY_NAME_ORDER = Prisma.sql`
  CASE
    WHEN t.name ~ '^[[:alpha:]]' THEN 0
    WHEN t.name ~ '^[[:digit:]]' THEN 1
    ELSE 2
  END,
  lower(t.name) ASC`;

@Injectable()
export class TracksRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: TracksQuery): Promise<CatalogListResult<TrackCatalogRecord>> {
    if (query.sort === 'plays' || query.sort === '-plays') {
      return this.listByPlays(query);
    }

    if (query.sort === 'name') {
      return this.listByFriendlyName(query);
    }

    const where = buildTrackWhere(query);
    const [data, total] = await Promise.all([
      this.client.track.findMany({
        include: TRACK_CATALOG_INCLUDE,
        orderBy: TRACK_ORDER_BY[query.sort],
        skip: getOffset(query),
        take: query.limit,
        where,
      }),
      this.client.track.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Orders tracks by play count (no-image rows last), breaking ties with the friendly name order.
   * A track's displayed cover falls back to its album, so the image check keys off
   * COALESCE(track, album). The ordered page of ids is resolved in raw SQL, then hydrated.
   */
  private async listByPlays(query: TracksQuery): Promise<CatalogListResult<TrackCatalogRecord>> {
    const direction = query.sort === 'plays' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    const filters = buildTrackSqlFilters(query);

    const rows = await this.client.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT t.id
      FROM tracks t
      JOIN albums alb ON alb.id = t.album_id
      LEFT JOIN listening_history lh ON lh.track_id = t.id
      ${filters}
      GROUP BY t.id, alb.image_url
      ORDER BY
        (COALESCE(t.image_url, alb.image_url) IS NULL),
        COUNT(lh.id) ${direction},
        ${TRACK_FRIENDLY_NAME_ORDER},
        t.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    return this.hydrate(
      rows.map((row) => row.id),
      buildTrackWhere(query),
    );
  }

  /** Orders tracks by name with letters first, then digits, then punctuation. */
  private async listByFriendlyName(
    query: TracksQuery,
  ): Promise<CatalogListResult<TrackCatalogRecord>> {
    const filters = buildTrackSqlFilters(query);

    const rows = await this.client.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT t.id
      FROM tracks t
      ${filters}
      ORDER BY
        ${TRACK_FRIENDLY_NAME_ORDER},
        t.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    return this.hydrate(
      rows.map((row) => row.id),
      buildTrackWhere(query),
    );
  }

  private async hydrate(
    ids: number[],
    where: Prisma.TrackWhereInput,
  ): Promise<CatalogListResult<TrackCatalogRecord>> {
    const [records, total] = await Promise.all([
      ids.length === 0
        ? Promise.resolve<TrackCatalogRecord[]>([])
        : this.client.track.findMany({
            include: TRACK_CATALOG_INCLUDE,
            where: { id: { in: ids } },
          }),
      this.client.track.count({ where }),
    ]);

    const byId = new Map(records.map((record) => [record.id, record]));
    const data = ids
      .map((id) => byId.get(id))
      .filter((record): record is TrackCatalogRecord => record !== undefined);

    return { data, total };
  }

  async findById(id: number): Promise<TrackCatalogRecord | null> {
    const record = await this.client.track.findUnique({
      include: TRACK_CATALOG_INCLUDE,
      where: { id },
    });
    return record === null || record.hiddenAt !== null ? null : record;
  }
}

function buildTrackWhere(query: TracksQuery): Prisma.TrackWhereInput {
  const where: Prisma.TrackWhereInput = { hiddenAt: null };

  if (query.q !== undefined) {
    where.name = { contains: query.q, mode: 'insensitive' };
  }

  if (query.albumId !== undefined) {
    where.albumId = query.albumId;
  }

  if (query.artistId !== undefined) {
    where.trackArtists = { some: { artistId: query.artistId } };
  }

  if (query.hasPreview !== undefined) {
    where.previewUrl = query.hasPreview ? { not: null } : null;
  }

  if (query.minDurationMs !== undefined || query.maxDurationMs !== undefined) {
    where.durationMs = {
      ...(query.minDurationMs !== undefined ? { gte: query.minDurationMs } : {}),
      ...(query.maxDurationMs !== undefined ? { lte: query.maxDurationMs } : {}),
    };
  }

  return where;
}

function buildTrackSqlFilters(query: TracksQuery): Prisma.Sql {
  const conditions: Prisma.Sql[] = [Prisma.sql`t.hidden_at IS NULL`];

  if (query.q !== undefined) {
    conditions.push(Prisma.sql`t.name ILIKE ${`%${query.q}%`}`);
  }

  if (query.albumId !== undefined) {
    conditions.push(Prisma.sql`t.album_id = ${query.albumId}`);
  }

  if (query.artistId !== undefined) {
    conditions.push(
      Prisma.sql`EXISTS (SELECT 1 FROM track_artists ta WHERE ta.track_id = t.id AND ta.artist_id = ${query.artistId})`,
    );
  }

  if (query.hasPreview !== undefined) {
    conditions.push(
      query.hasPreview ? Prisma.sql`t.preview_url IS NOT NULL` : Prisma.sql`t.preview_url IS NULL`,
    );
  }

  if (query.minDurationMs !== undefined) {
    conditions.push(Prisma.sql`t.duration_ms >= ${query.minDurationMs}`);
  }

  if (query.maxDurationMs !== undefined) {
    conditions.push(Prisma.sql`t.duration_ms <= ${query.maxDurationMs}`);
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
}
