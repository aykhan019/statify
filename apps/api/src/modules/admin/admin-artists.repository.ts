import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AdminArtistsListQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from '../catalog/catalog.pagination';
import { toPositiveInt } from './admin-search.util';

const ARTIST_ADMIN_INCLUDE = {
  _count: {
    select: {
      albums: true,
      trackArtists: true,
    },
  },
} as const satisfies Prisma.ArtistInclude;

export type AdminArtistRecord = Prisma.ArtistGetPayload<{
  include: typeof ARTIST_ADMIN_INCLUDE;
}>;

export interface AdminArtistListResult {
  data: AdminArtistRecord[];
  total: number;
}

@Injectable()
export class AdminArtistsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: AdminArtistsListQuery): Promise<AdminArtistListResult> {
    const where = buildWhere(query);
    const asId = query.q === undefined ? null : toPositiveInt(query.q);

    if (asId === null) {
      const [data, total] = await Promise.all([
        this.client.artist.findMany({
          include: ARTIST_ADMIN_INCLUDE,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          skip: getOffset(query),
          take: query.limit,
          where,
        }),
        this.client.artist.count({ where }),
      ]);
      return { data, total };
    }

    return this.listWithIdPriority(query, where, asId);
  }

  private async listWithIdPriority(
    query: AdminArtistsListQuery,
    where: Prisma.ArtistWhereInput,
    asId: number,
  ): Promise<AdminArtistListResult> {
    const pattern = `%${query.q}%`;
    const includeHiddenFilter = query.includeHidden
      ? Prisma.sql`TRUE`
      : Prisma.sql`hidden_at IS NULL`;

    const rows = await this.client.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT id
      FROM artists
      WHERE ${includeHiddenFilter}
        AND (id = ${asId} OR name ILIKE ${pattern})
      ORDER BY (id = ${asId}) DESC, name ASC, id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    const ids = rows.map((row) => row.id);
    const [records, total] = await Promise.all([
      ids.length === 0
        ? Promise.resolve<AdminArtistRecord[]>([])
        : this.client.artist.findMany({
            include: ARTIST_ADMIN_INCLUDE,
            where: { id: { in: ids } },
          }),
      this.client.artist.count({ where }),
    ]);
    const byId = new Map(records.map((record) => [record.id, record]));
    const data = ids
      .map((id) => byId.get(id))
      .filter((record): record is AdminArtistRecord => record !== undefined);
    return { data, total };
  }

  findById(id: number): Promise<AdminArtistRecord | null> {
    return this.client.artist.findUnique({
      include: ARTIST_ADMIN_INCLUDE,
      where: { id },
    });
  }

  update(id: number, data: { name: string; imageUrl: string | null }): Promise<AdminArtistRecord> {
    return this.client.artist.update({
      include: ARTIST_ADMIN_INCLUDE,
      where: { id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
  }

  setHidden(id: number, hidden: boolean): Promise<AdminArtistRecord> {
    return this.client.artist.update({
      include: ARTIST_ADMIN_INCLUDE,
      where: { id },
      data: { hiddenAt: hidden ? new Date() : null },
    });
  }
}

function buildWhere(query: AdminArtistsListQuery): Prisma.ArtistWhereInput {
  const where: Prisma.ArtistWhereInput = {};
  if (!query.includeHidden) {
    where.hiddenAt = null;
  }
  if (query.q !== undefined) {
    const or: Prisma.ArtistWhereInput[] = [{ name: { contains: query.q, mode: 'insensitive' } }];
    const asId = toPositiveInt(query.q);
    if (asId !== null) {
      or.push({ id: asId });
    }
    where.OR = or;
  }
  return where;
}
