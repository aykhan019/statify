import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { UserPlaylistsListQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from '../catalog/catalog.pagination';
import type { CatalogListResult } from '../catalog/catalog.types';

const USER_PLAYLIST_INCLUDE = {
  _count: { select: { tracks: true } },
  user: { select: { id: true, displayName: true } },
} as const satisfies Prisma.UserPlaylistInclude;

export type UserPlaylistRecord = Prisma.UserPlaylistGetPayload<{
  include: typeof USER_PLAYLIST_INCLUDE;
}>;

export interface CreateUserPlaylistInput {
  userId: number;
  name: string;
  description?: string;
  isPublic: boolean;
}

@Injectable()
export class UserPlaylistsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(input: CreateUserPlaylistInput): Promise<UserPlaylistRecord> {
    return this.client.userPlaylist.create({
      data: {
        userId: input.userId,
        name: input.name,
        description: input.description ?? null,
        isPublic: input.isPublic,
      },
      include: USER_PLAYLIST_INCLUDE,
    });
  }

  async listForOwner(
    userId: number,
    query: UserPlaylistsListQuery,
  ): Promise<CatalogListResult<UserPlaylistRecord>> {
    const where: Prisma.UserPlaylistWhereInput = { userId };
    if (query.q !== undefined) {
      where.name = { contains: query.q, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.client.userPlaylist.findMany({
        where,
        include: USER_PLAYLIST_INCLUDE,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: getOffset(query),
        take: query.limit,
      }),
      this.client.userPlaylist.count({ where }),
    ]);

    return { data, total };
  }
}
