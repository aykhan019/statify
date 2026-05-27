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

// Play count has no direct album relation (albums -> tracks -> listening_history), so the
// `plays` sorts are handled by listByPlays; the rest map directly to Prisma orderBy.
type AlbumOrderableSort = Exclude<AlbumSort, 'plays' | '-plays'>;

const ALBUM_ORDER_BY: Record<AlbumOrderableSort, Prisma.AlbumOrderByWithRelationInput[]> = {
  '-createdAt': [{ createdAt: 'desc' }, { id: 'asc' }],
  '-name': [{ name: 'desc' }, { id: 'asc' }],
  createdAt: [{ createdAt: 'asc' }, { id: 'asc' }],
  name: [{ name: 'asc' }, { id: 'asc' }],
};

@Injectable()
export class AlbumsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: AlbumsQuery): Promise<CatalogListResult<AlbumCatalogRecord>> {
    if (query.sort === 'plays' || query.sort === '-plays') {
      return this.listByPlays(query);
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
   * Orders albums by total plays across their tracks. Prisma's orderBy cannot reach a
   * two-hop relation count, so we resolve the ordered page of IDs in raw SQL, then hydrate
   * full records (with includes) and restore that order in memory.
   */
  private async listByPlays(query: AlbumsQuery): Promise<CatalogListResult<AlbumCatalogRecord>> {
    const where = buildAlbumWhere(query);
    const direction = query.sort === 'plays' ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    const filters = buildAlbumPlaysFilters(query);

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
        CASE WHEN a.name ~ '^[[:alnum:]]' THEN 0 ELSE 1 END,
        lower(a.name) ASC,
        a.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    const ids = rows.map((row) => row.id);

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

  findById(id: number): Promise<AlbumDetailRecord | null> {
    return this.client.album.findUnique({
      include: ALBUM_DETAIL_INCLUDE,
      where: { id },
    });
  }
}

function buildAlbumWhere(query: AlbumsQuery): Prisma.AlbumWhereInput {
  const where: Prisma.AlbumWhereInput = {};

  if (query.q !== undefined) {
    where.name = { contains: query.q, mode: 'insensitive' };
  }

  if (query.artistId !== undefined) {
    where.primaryArtistId = query.artistId;
  }

  return where;
}

function buildAlbumPlaysFilters(query: AlbumsQuery): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

  if (query.q !== undefined) {
    conditions.push(Prisma.sql`a.name ILIKE ${`%${query.q}%`}`);
  }

  if (query.artistId !== undefined) {
    conditions.push(Prisma.sql`a.primary_artist_id = ${query.artistId}`);
  }

  if (conditions.length === 0) {
    return Prisma.empty;
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`;
}
