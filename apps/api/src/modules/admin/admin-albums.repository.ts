import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AdminAlbumsListQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from '../catalog/catalog.pagination';
import { toPositiveInt } from './admin-search.util';

const ALBUM_ADMIN_INCLUDE = {
  primaryArtist: true,
  _count: { select: { tracks: true } },
} as const satisfies Prisma.AlbumInclude;

export type AdminAlbumRecord = Prisma.AlbumGetPayload<{
  include: typeof ALBUM_ADMIN_INCLUDE;
}>;

export interface AdminAlbumListResult {
  data: AdminAlbumRecord[];
  total: number;
}

@Injectable()
export class AdminAlbumsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async list(query: AdminAlbumsListQuery): Promise<AdminAlbumListResult> {
    const where = buildWhere(query);
    const asId = query.q === undefined ? null : toPositiveInt(query.q);

    if (asId === null) {
      const [data, total] = await Promise.all([
        this.client.album.findMany({
          include: ALBUM_ADMIN_INCLUDE,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          skip: getOffset(query),
          take: query.limit,
          where,
        }),
        this.client.album.count({ where }),
      ]);
      return { data, total };
    }

    const pattern = `%${query.q}%`;
    const includeHiddenFilter = query.includeHidden
      ? Prisma.sql`TRUE`
      : Prisma.sql`al.hidden_at IS NULL`;

    const rows = await this.client.$queryRaw<Array<{ id: number }>>(Prisma.sql`
      SELECT al.id
      FROM albums al
      LEFT JOIN artists ar ON al.primary_artist_id = ar.id
      WHERE ${includeHiddenFilter}
        AND (al.id = ${asId} OR al.name ILIKE ${pattern} OR ar.name ILIKE ${pattern})
      ORDER BY (al.id = ${asId}) DESC, al.name ASC, al.id ASC
      OFFSET ${getOffset(query)}
      LIMIT ${query.limit}
    `);

    const ids = rows.map((row) => row.id);
    const [records, total] = await Promise.all([
      ids.length === 0
        ? Promise.resolve<AdminAlbumRecord[]>([])
        : this.client.album.findMany({
            include: ALBUM_ADMIN_INCLUDE,
            where: { id: { in: ids } },
          }),
      this.client.album.count({ where }),
    ]);
    const byId = new Map(records.map((record) => [record.id, record]));
    const data = ids
      .map((id) => byId.get(id))
      .filter((record): record is AdminAlbumRecord => record !== undefined);
    return { data, total };
  }

  findById(id: number): Promise<AdminAlbumRecord | null> {
    return this.client.album.findUnique({
      include: ALBUM_ADMIN_INCLUDE,
      where: { id },
    });
  }

  update(id: number, data: { name: string; imageUrl: string | null }): Promise<AdminAlbumRecord> {
    return this.client.album.update({
      include: ALBUM_ADMIN_INCLUDE,
      where: { id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
      },
    });
  }

  setHidden(id: number, hidden: boolean): Promise<AdminAlbumRecord> {
    return this.client.album.update({
      include: ALBUM_ADMIN_INCLUDE,
      where: { id },
      data: { hiddenAt: hidden ? new Date() : null },
    });
  }
}

function buildWhere(query: AdminAlbumsListQuery): Prisma.AlbumWhereInput {
  const where: Prisma.AlbumWhereInput = {};
  if (!query.includeHidden) {
    where.hiddenAt = null;
  }
  if (query.q !== undefined) {
    const or: Prisma.AlbumWhereInput[] = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { primaryArtist: { name: { contains: query.q, mode: 'insensitive' } } },
    ];
    const asId = toPositiveInt(query.q);
    if (asId !== null) {
      or.push({ id: asId });
    }
    where.OR = or;
  }
  return where;
}
