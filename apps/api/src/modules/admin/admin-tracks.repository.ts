import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AdminTracksListQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from '../catalog/catalog.pagination';
import {
  buildScopedFilter,
  idFilterValue,
  parseSearchQuery,
  toPositiveInt,
} from './admin-search.util';

const TRACK_ADMIN_INCLUDE = {
  album: { include: { primaryArtist: true } },
  _count: { select: { listeningHistory: true } },
} as const satisfies Prisma.TrackInclude;

export type AdminTrackRecord = Prisma.TrackGetPayload<{
  include: typeof TRACK_ADMIN_INCLUDE;
}>;

export interface AdminTrackListResult {
  data: AdminTrackRecord[];
  total: number;
}

@Injectable()
export class AdminTracksRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: AdminTracksListQuery): Promise<AdminTrackListResult> {
    const where = buildWhere(query);
    const asId = query.q === undefined ? null : toPositiveInt(query.q);

    if (asId === null) {
      const [data, total] = await Promise.all([
        this.client.track.findMany({
          include: TRACK_ADMIN_INCLUDE,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          skip: getOffset(query),
          take: query.limit,
          where,
        }),
        this.client.track.count({ where }),
      ]);
      return { data, total };
    }

    const pattern = `%${query.q}%`;
    const includeHiddenFilter = query.includeHidden
      ? Prisma.sql`TRUE`
      : Prisma.sql`t.hidden_at IS NULL`;

    const rows = await this.client.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT t.id
      FROM tracks t
      LEFT JOIN albums al ON t.album_id = al.id
      LEFT JOIN artists ar ON al.primary_artist_id = ar.id
      WHERE ${includeHiddenFilter}
        AND (
          t.id = ${asId}
          OR t.name ILIKE ${pattern}
          OR al.name ILIKE ${pattern}
          OR ar.name ILIKE ${pattern}
        )
      ORDER BY (t.id = ${asId}) DESC, t.name ASC, t.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    const ids = rows.map((row) => row.id);
    const [records, total] = await Promise.all([
      ids.length === 0
        ? Promise.resolve<AdminTrackRecord[]>([])
        : this.client.track.findMany({
            include: TRACK_ADMIN_INCLUDE,
            where: { id: { in: ids } },
          }),
      this.client.track.count({ where }),
    ]);
    const byId = new Map(records.map((record) => [record.id, record]));
    const data = ids
      .map((id) => byId.get(id))
      .filter((record): record is AdminTrackRecord => record !== undefined);
    return { data, total };
  }

  findById(id: number): Promise<AdminTrackRecord | null> {
    return this.client.track.findUnique({
      include: TRACK_ADMIN_INCLUDE,
      where: { id },
    });
  }

  update(id: number, data: { name: string; imageUrl: string | null }): Promise<AdminTrackRecord> {
    return this.client.track.update({
      include: TRACK_ADMIN_INCLUDE,
      where: { id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
  }

  setHidden(id: number, hidden: boolean): Promise<AdminTrackRecord> {
    return this.client.track.update({
      include: TRACK_ADMIN_INCLUDE,
      where: { id },
      data: { hiddenAt: hidden ? new Date() : null },
    });
  }
}

const imageUrlFilter = (v: string): Prisma.TrackWhereInput => ({
  imageUrl: { contains: v, mode: 'insensitive' },
});

function buildWhere(query: AdminTracksListQuery): Prisma.TrackWhereInput {
  const where: Prisma.TrackWhereInput = {};
  if (!query.includeHidden) {
    where.hiddenAt = null;
  }
  if (query.q !== undefined) {
    const scoped = buildScopedFilter<Prisma.TrackWhereInput>(parseSearchQuery(query.q), {
      id: (v) => ({ id: idFilterValue(v) }),
      name: (v) => ({ name: { contains: v, mode: 'insensitive' } }),
      title: (v) => ({ name: { contains: v, mode: 'insensitive' } }),
      track: (v) => ({ name: { contains: v, mode: 'insensitive' } }),
      album: (v) => ({ album: { name: { contains: v, mode: 'insensitive' } } }),
      artist: (v) => ({ album: { primaryArtist: { name: { contains: v, mode: 'insensitive' } } } }),
      image: imageUrlFilter,
      'image-url': imageUrlFilter,
      imageurl: imageUrlFilter,
      url: imageUrlFilter,
    });
    if (scoped !== null) {
      Object.assign(where, scoped);
    } else {
      const or: Prisma.TrackWhereInput[] = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { album: { name: { contains: query.q, mode: 'insensitive' } } },
        { album: { primaryArtist: { name: { contains: query.q, mode: 'insensitive' } } } },
      ];
      const asId = toPositiveInt(query.q);
      if (asId !== null) {
        or.push({ id: asId });
      }
      where.OR = or;
    }
  }
  return where;
}
