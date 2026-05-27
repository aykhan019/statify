import { Injectable } from '@nestjs/common';
import type { Artist, Prisma } from '@prisma/client';
import { Prisma as PrismaClient } from '@prisma/client';
import type { ArtistSort, ArtistsQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from './catalog.pagination';
import type { CatalogListResult } from './catalog.types';

const ARTIST_DETAIL_INCLUDE = {
  _count: {
    select: {
      albums: true,
      trackArtists: true,
    },
  },
} as const satisfies Prisma.ArtistInclude;

export type ArtistDetailRecord = Prisma.ArtistGetPayload<{
  include: typeof ARTIST_DETAIL_INCLUDE;
}>;

// `plays` (raw aggregation) and `name` (friendly raw ordering) are handled separately; the
// remaining sorts map directly to Prisma orderBy.
type ArtistPrismaSort = Exclude<ArtistSort, 'plays' | '-plays' | 'name'>;

const ARTIST_ORDER_BY: Record<ArtistPrismaSort, Prisma.ArtistOrderByWithRelationInput[]> = {
  '-createdAt': [{ createdAt: 'desc' }, { id: 'asc' }],
  '-name': [{ name: 'desc' }, { id: 'asc' }],
  createdAt: [{ createdAt: 'asc' }, { id: 'asc' }],
};

// Name ordering for the `name` sort and as a tie-break: letters (A-Z) first, then digits, then
// punctuation/symbols, alphabetical within each group.
const ARTIST_FRIENDLY_NAME_ORDER = PrismaClient.sql`
  CASE
    WHEN a.name ~ '^[[:alpha:]]' THEN 0
    WHEN a.name ~ '^[[:digit:]]' THEN 1
    ELSE 2
  END,
  lower(a.name) ASC`;

@Injectable()
export class ArtistsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ArtistsQuery): Promise<CatalogListResult<Artist>> {
    if (query.sort === 'plays' || query.sort === '-plays') {
      return this.listByPlays(query);
    }

    if (query.sort === 'name') {
      return this.listByFriendlyName(query);
    }

    const where = buildArtistWhere(query);
    const [data, total] = await Promise.all([
      this.client.artist.findMany({
        orderBy: ARTIST_ORDER_BY[query.sort],
        skip: getOffset(query),
        take: query.limit,
        where,
      }),
      this.client.artist.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Orders artists by total plays across the tracks they appear on. Resolves the ordered page of
   * ids in raw SQL (no-image artists last, then play count, then the friendly name order), then
   * hydrates and restores that order.
   */
  private async listByPlays(query: ArtistsQuery): Promise<CatalogListResult<Artist>> {
    const direction = query.sort === 'plays' ? PrismaClient.sql`ASC` : PrismaClient.sql`DESC`;
    const filters = buildArtistSqlFilters(query);

    const rows = await this.client.$queryRaw<Array<{ id: number }>>(PrismaClient.sql`
      SELECT a.id
      FROM artists a
      LEFT JOIN track_artists ta ON ta.artist_id = a.id
      LEFT JOIN listening_history lh ON lh.track_id = ta.track_id
      ${filters}
      GROUP BY a.id
      ORDER BY
        (a.image_url IS NULL),
        COUNT(lh.id) ${direction},
        ${ARTIST_FRIENDLY_NAME_ORDER},
        a.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    return this.hydrate(
      rows.map((row) => row.id),
      buildArtistWhere(query),
    );
  }

  /** Orders artists by name with letters first, then digits, then punctuation. */
  private async listByFriendlyName(query: ArtistsQuery): Promise<CatalogListResult<Artist>> {
    const filters = buildArtistSqlFilters(query);

    const data = await this.client.$queryRaw<Artist[]>(PrismaClient.sql`
      SELECT
        a.id,
        a.spotify_uri AS "spotifyUri",
        a.name,
        a.image_url AS "imageUrl",
        a.created_at AS "createdAt"
      FROM artists a
      ${filters}
      ORDER BY
        ${ARTIST_FRIENDLY_NAME_ORDER},
        a.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    const total = await this.client.artist.count({ where: buildArtistWhere(query) });

    return { data, total };
  }

  private async hydrate(
    ids: number[],
    where: Prisma.ArtistWhereInput,
  ): Promise<CatalogListResult<Artist>> {
    const [records, total] = await Promise.all([
      ids.length === 0
        ? Promise.resolve<Artist[]>([])
        : this.client.artist.findMany({ where: { id: { in: ids } } }),
      this.client.artist.count({ where }),
    ]);

    const byId = new Map(records.map((record) => [record.id, record]));
    const data = ids
      .map((id) => byId.get(id))
      .filter((record): record is Artist => record !== undefined);

    return { data, total };
  }

  findById(id: number): Promise<ArtistDetailRecord | null> {
    return this.client.artist.findUnique({
      include: ARTIST_DETAIL_INCLUDE,
      where: { id },
    });
  }
}

function buildArtistWhere(query: ArtistsQuery): Prisma.ArtistWhereInput {
  if (query.q === undefined) {
    return {};
  }

  return {
    name: { contains: query.q, mode: 'insensitive' },
  };
}

function buildArtistSqlFilters(query: ArtistsQuery): Prisma.Sql {
  if (query.q === undefined) {
    return PrismaClient.empty;
  }

  return PrismaClient.sql`WHERE a.name ILIKE ${`%${query.q}%`}`;
}
