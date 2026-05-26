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

const ARTIST_ORDER_BY: Record<ArtistSort, Prisma.ArtistOrderByWithRelationInput[]> = {
  '-createdAt': [{ createdAt: 'desc' }, { id: 'asc' }],
  '-name': [{ name: 'desc' }, { id: 'asc' }],
  createdAt: [{ createdAt: 'asc' }, { id: 'asc' }],
  name: [{ name: 'asc' }, { id: 'asc' }],
};

@Injectable()
export class ArtistsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: ArtistsQuery): Promise<CatalogListResult<Artist>> {
    const where = buildArtistWhere(query);

    if (query.q === undefined && query.sort === 'name') {
      return this.listByFriendlyNameOrder(query);
    }

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

  private async listByFriendlyNameOrder(query: ArtistsQuery): Promise<CatalogListResult<Artist>> {
    const [data, total] = await Promise.all([
      this.client.$queryRaw<Artist[]>(PrismaClient.sql`
        SELECT
          id,
          spotify_uri AS "spotifyUri",
          name,
          image_url AS "imageUrl",
          created_at AS "createdAt"
        FROM artists
        ORDER BY
          CASE WHEN name ~ '^[[:alnum:]]' THEN 0 ELSE 1 END,
          lower(name) ASC,
          id ASC
        OFFSET ${getOffset(query)}
        LIMIT ${query.limit}
      `),
      this.client.artist.count({ where: {} }),
    ]);

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
