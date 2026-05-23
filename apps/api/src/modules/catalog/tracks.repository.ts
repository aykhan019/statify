import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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

const TRACK_ORDER_BY: Record<TrackSort, Prisma.TrackOrderByWithRelationInput[]> = {
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

  return where;
}
