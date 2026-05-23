import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { MpdPlaylistSort, MpdPlaylistsQuery, OffsetPaginationQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from '../catalog/catalog.pagination';
import type { CatalogListResult } from '../catalog/catalog.types';

const MPD_PLAYLIST_LIST_INCLUDE = {
  _count: { select: { tracks: true } },
} as const satisfies Prisma.MpdPlaylistInclude;

const MPD_PLAYLIST_TRACK_INCLUDE = {
  track: {
    include: {
      album: { include: { primaryArtist: true } },
      trackArtists: { include: { artist: true } },
    },
  },
} as const satisfies Prisma.MpdPlaylistTrackInclude;

export type MpdPlaylistListRecord = Prisma.MpdPlaylistGetPayload<{
  include: typeof MPD_PLAYLIST_LIST_INCLUDE;
}>;

export type MpdPlaylistTrackRecord = Prisma.MpdPlaylistTrackGetPayload<{
  include: typeof MPD_PLAYLIST_TRACK_INCLUDE;
}>;

const MPD_PLAYLIST_ORDER_BY: Record<MpdPlaylistSort, Prisma.MpdPlaylistOrderByWithRelationInput[]> =
  {
    '-name': [{ name: 'desc' }, { id: 'asc' }],
    '-numFollowers': [{ numFollowers: 'desc' }, { id: 'asc' }],
    name: [{ name: 'asc' }, { id: 'asc' }],
    numFollowers: [{ numFollowers: 'asc' }, { id: 'asc' }],
  };

@Injectable()
export class MpdPlaylistsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: MpdPlaylistsQuery): Promise<CatalogListResult<MpdPlaylistListRecord>> {
    const where = buildWhere(query);
    const [data, total] = await Promise.all([
      this.client.mpdPlaylist.findMany({
        include: MPD_PLAYLIST_LIST_INCLUDE,
        orderBy: MPD_PLAYLIST_ORDER_BY[query.sort],
        skip: getOffset(query),
        take: query.limit,
        where,
      }),
      this.client.mpdPlaylist.count({ where }),
    ]);

    return { data, total };
  }

  findById(id: number): Promise<MpdPlaylistListRecord | null> {
    return this.client.mpdPlaylist.findUnique({
      include: MPD_PLAYLIST_LIST_INCLUDE,
      where: { id },
    });
  }

  async listTracks(
    playlistId: number,
    query: OffsetPaginationQuery,
  ): Promise<CatalogListResult<MpdPlaylistTrackRecord>> {
    const where: Prisma.MpdPlaylistTrackWhereInput = { playlistId };
    const [data, total] = await Promise.all([
      this.client.mpdPlaylistTrack.findMany({
        include: MPD_PLAYLIST_TRACK_INCLUDE,
        orderBy: { pos: 'asc' },
        skip: getOffset(query),
        take: query.limit,
        where,
      }),
      this.client.mpdPlaylistTrack.count({ where }),
    ]);

    return { data, total };
  }
}

function buildWhere(query: MpdPlaylistsQuery): Prisma.MpdPlaylistWhereInput {
  const where: Prisma.MpdPlaylistWhereInput = {};
  if (query.q !== undefined) {
    where.name = { contains: query.q, mode: 'insensitive' };
  }
  return where;
}
