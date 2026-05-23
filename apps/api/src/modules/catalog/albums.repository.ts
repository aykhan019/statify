import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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

const ALBUM_ORDER_BY: Record<AlbumSort, Prisma.AlbumOrderByWithRelationInput[]> = {
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
