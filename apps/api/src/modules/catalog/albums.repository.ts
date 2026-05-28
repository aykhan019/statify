import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AlbumSort, AlbumsQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from './catalog.pagination';
import type { CatalogListResult } from './catalog.types';

const ALBUM_CATALOG_INCLUDE = {
  primaryArtist: true,
} as const satisfies Prisma.AlbumInclude;

const ALBUM_DETAIL_INCLUDE = {
  ...ALBUM_CATALOG_INCLUDE,
  _count: {
    select: {
      tracks: true,
    },
  },
} as const satisfies Prisma.AlbumInclude;

export type AlbumCatalogRecord = Prisma.AlbumGetPayload<{
  include: typeof ALBUM_CATALOG_INCLUDE;
}>;

export type AlbumDetailRecord = Prisma.AlbumGetPayload<{
  include: typeof ALBUM_DETAIL_INCLUDE;
}>;

// `plays` (raw aggregation) and `name` (friendly raw ordering) are handled separately; the
// remaining sorts map directly to Prisma orderBy.
type AlbumPrismaSort = Exclude<AlbumSort, 'plays' | '-plays' | 'name'>;

const ALBUM_ORDER_BY: Record<AlbumPrismaSort, Prisma.AlbumOrderByWithRelationInput[]> = {
  '-createdAt': [{ createdAt: 'desc' }, { id: 'asc' }],
  '-name': [{ name: 'desc' }, { id: 'asc' }],
  createdAt: [{ createdAt: 'asc' }, { id: 'asc' }],
};

// Name ordering for the `name` sort and as a tie-break: letters (A-Z) first, then digits, then
// punctuation/symbols, alphabetical within each group.
const ALBUM_FRIENDLY_NAME_ORDER = Prisma.sql`
  CASE
    WHEN a.name ~ '^[[:alpha:]]' THEN 0
    WHEN a.name ~ '^[[:digit:]]' THEN 1
    ELSE 2
  END,
  lower(a.name) ASC`;

@Injectable()
export class AlbumsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: AlbumsQuery): Promise<CatalogListResult<AlbumCatalogRecord>> {
    if (query.sort === 'plays' || query.sort === '-plays') {
      return this.listByPlays(query);
    }

    if (query.sort === 'name') {
      return this.listByFriendlyName(query);
    }

    const where = buildAlbumWhere(query);
    const [data, total] = await Promise.all([
      this.client.album.findMany({
        include: ALBUM_CATALOG_INCLUDE,
        orderBy: ALBUM_ORDER_BY[query.sort],
        skip: getOffset(query),
        take: query.limit,
        where,
      }),
      this.client.album.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Orders albums by total plays across their tracks (no-image rows last). Prisma's orderBy
   * cannot reach a two-hop relation count, so the ordered page of ids is resolved in raw SQL.
   */
  private async listByPlays(query: AlbumsQuery): Promise<CatalogListResult<AlbumCatalogRecord>> {
    const direction = query.sort === 'plays' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    const filters = buildAlbumSqlFilters(query);

    const rows = await this.client.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT a.id
      FROM albums a
      LEFT JOIN tracks t ON t.album_id = a.id
      LEFT JOIN listening_history lh ON lh.track_id = t.id
      ${filters}
      GROUP BY a.id
      ORDER BY
        (a.image_url IS NULL),
        COUNT(lh.id) ${direction},
        ${ALBUM_FRIENDLY_NAME_ORDER},
        a.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    return this.hydrate(
      rows.map((row) => row.id),
      buildAlbumWhere(query),
    );
  }

  /** Orders albums by name with letters first, then digits, then punctuation. */
  private async listByFriendlyName(
    query: AlbumsQuery,
  ): Promise<CatalogListResult<AlbumCatalogRecord>> {
    const filters = buildAlbumSqlFilters(query);

    const rows = await this.client.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT a.id
      FROM albums a
      ${filters}
      ORDER BY
        ${ALBUM_FRIENDLY_NAME_ORDER},
        a.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    return this.hydrate(
      rows.map((row) => row.id),
      buildAlbumWhere(query),
    );
  }

  private async hydrate(
    ids: number[],
    where: Prisma.AlbumWhereInput,
  ): Promise<CatalogListResult<AlbumCatalogRecord>> {
    const [records, total] = await Promise.all([
      ids.length === 0
        ? Promise.resolve<AlbumCatalogRecord[]>([])
        : this.client.album.findMany({
            include: ALBUM_CATALOG_INCLUDE,
            where: { id: { in: ids } },
          }),
      this.client.album.count({ where }),
    ]);

    const byId = new Map(records.map((record) => [record.id, record]));
    const data = ids
      .map((id) => byId.get(id))
      .filter((record): record is AlbumCatalogRecord => record !== undefined);

    return { data, total };
  }

  async findById(id: number): Promise<AlbumDetailRecord | null> {
    const record = await this.client.album.findUnique({
      include: ALBUM_DETAIL_INCLUDE,
      where: { id },
    });
    return record === null || record.hiddenAt !== null ? null : record;
  }
}

function buildAlbumWhere(query: AlbumsQuery): Prisma.AlbumWhereInput {
  const where: Prisma.AlbumWhereInput = { hiddenAt: null };

  if (query.q !== undefined) {
    where.name = { contains: query.q, mode: 'insensitive' };
  }

  if (query.artistId !== undefined) {
    where.primaryArtistId = query.artistId;
  }

  return where;
}

function buildAlbumSqlFilters(query: AlbumsQuery): Prisma.Sql {
  const conditions: Prisma.Sql[] = [Prisma.sql`a.hidden_at IS NULL`];

  if (query.q !== undefined) {
    conditions.push(Prisma.sql`a.name ILIKE ${`%${query.q}%`}`);
  }

  if (query.artistId !== undefined) {
    conditions.push(Prisma.sql`a.primary_artist_id = ${query.artistId}`);
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
}
