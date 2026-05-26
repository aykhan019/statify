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

// Play count needs a friendly-name tie-break (so zero/tied plays read as a clean A-Z), which
// Prisma orderBy cannot express; the `plays` sorts go through listByPlays instead.
type TrackOrderableSort = Exclude<TrackSort, 'plays' | '-plays'>;

const TRACK_ORDER_BY: Record<TrackOrderableSort, Prisma.TrackOrderByWithRelationInput[]> = {
  '-durationMs': [{ durationMs: 'desc' }, { id: 'asc' }],
  '-name': [{ name: 'desc' }, { id: 'asc' }],
  durationMs: [{ durationMs: 'asc' }, { id: 'asc' }],
  name: [{ name: 'asc' }, { id: 'asc' }],
};

@Injectable()
export class TracksRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: TracksQuery): Promise<CatalogListResult<TrackCatalogRecord>> {
    if (query.sort === 'plays' || query.sort === '-plays') {
      return this.listByPlays(query);
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
   * Orders tracks by play count, breaking ties with the friendly name order so that with no
   * listening history (all zero) the catalog reads as a clean A-Z with symbol-led names last.
   * The ordered page of IDs is resolved in raw SQL, then hydrated with includes and reordered.
   */
  private async listByPlays(query: TracksQuery): Promise<CatalogListResult<TrackCatalogRecord>> {
    const where = buildTrackWhere(query);
    const direction = query.sort === 'plays' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    const filters = buildTrackPlaysFilters(query);

    const rows = await this.client.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT t.id
      FROM tracks t
      LEFT JOIN listening_history lh ON lh.track_id = t.id
      ${filters}
      GROUP BY t.id
      ORDER BY
        COUNT(lh.id) ${direction},
        CASE WHEN t.name ~ '^[[:alnum:]]' THEN 0 ELSE 1 END,
        lower(t.name) ASC,
        t.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    const ids = rows.map((row) => row.id);

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

  findById(id: number): Promise<TrackCatalogRecord | null> {
    return this.client.track.findUnique({
      include: TRACK_CATALOG_INCLUDE,
      where: { id },
    });
  }
}

function buildTrackWhere(query: TracksQuery): Prisma.TrackWhereInput {
  const where: Prisma.TrackWhereInput = {};

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

function buildTrackPlaysFilters(query: TracksQuery): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

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

  if (conditions.length === 0) {
    return Prisma.empty;
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
}
