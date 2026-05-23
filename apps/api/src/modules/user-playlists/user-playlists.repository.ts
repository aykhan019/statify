import { HttpStatus, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  AppError,
  ErrorCode,
  type UserPlaylistTracksQuery,
  type UserPlaylistsListQuery,
} from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import { getOffset } from '../catalog/catalog.pagination';
import type { CatalogListResult } from '../catalog/catalog.types';

const USER_PLAYLIST_INCLUDE = {
  _count: { select: { tracks: true } },
  user: { select: { id: true, displayName: true } },
} as const satisfies Prisma.UserPlaylistInclude;

const USER_PLAYLIST_TRACK_INCLUDE = {
  track: {
    include: {
      album: { include: { primaryArtist: true } },
      trackArtists: { include: { artist: true }, orderBy: { artistId: 'asc' } },
    },
  },
} as const satisfies Prisma.UserPlaylistTrackInclude;

export type UserPlaylistRecord = Prisma.UserPlaylistGetPayload<{
  include: typeof USER_PLAYLIST_INCLUDE;
}>;

export type UserPlaylistTrackRecord = Prisma.UserPlaylistTrackGetPayload<{
  include: typeof USER_PLAYLIST_TRACK_INCLUDE;
}>;

export interface CreateUserPlaylistInput {
  userId: number;
  name: string;
  description?: string;
  isPublic: boolean;
}

@Injectable()
export class UserPlaylistsRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
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

  findOwnedById(userId: number, playlistId: number): Promise<UserPlaylistRecord | null> {
    return this.client.userPlaylist.findFirst({
      where: { id: playlistId, userId },
      include: USER_PLAYLIST_INCLUDE,
    });
  }

  async setVisibility(
    userId: number,
    playlistId: number,
    isPublic: boolean,
  ): Promise<UserPlaylistRecord> {
    return this.prisma.transaction(async (tx) => {
      const playlist = await tx.userPlaylist.findFirst({
        where: { id: playlistId, userId },
        select: { id: true },
      });
      if (playlist === null) {
        throw new AppError({
          code: ErrorCode.PLAYLIST_NOT_FOUND,
          message: 'Playlist not found',
          httpStatus: HttpStatus.NOT_FOUND,
        });
      }
      return tx.userPlaylist.update({
        where: { id: playlistId },
        data: { isPublic },
        include: USER_PLAYLIST_INCLUDE,
      });
    });
  }

  async listTracks(
    playlistId: number,
    query: UserPlaylistTracksQuery,
  ): Promise<CatalogListResult<UserPlaylistTrackRecord>> {
    const where: Prisma.UserPlaylistTrackWhereInput = { userPlaylistId: playlistId };
    const [data, total] = await Promise.all([
      this.client.userPlaylistTrack.findMany({
        where,
        include: USER_PLAYLIST_TRACK_INCLUDE,
        orderBy: { pos: 'asc' },
        skip: getOffset(query),
        take: query.limit,
      }),
      this.client.userPlaylistTrack.count({ where }),
    ]);

    return { data, total };
  }

  async addTrack(userId: number, playlistId: number, trackId: number): Promise<UserPlaylistRecord> {
    return this.prisma.transaction(async (tx) => {
      const playlist = await tx.userPlaylist.findFirst({
        where: { id: playlistId, userId },
        select: { id: true },
      });
      if (playlist === null) {
        throw new AppError({
          code: ErrorCode.PLAYLIST_NOT_FOUND,
          message: 'Playlist not found',
          httpStatus: HttpStatus.NOT_FOUND,
        });
      }

      const track = await tx.track.findUnique({ where: { id: trackId }, select: { id: true } });
      if (track === null) {
        throw new AppError({
          code: ErrorCode.TRACK_NOT_FOUND,
          message: 'Track not found',
          httpStatus: HttpStatus.NOT_FOUND,
        });
      }

      const duplicate = await tx.userPlaylistTrack.findFirst({
        where: { userPlaylistId: playlistId, trackId },
        select: { trackId: true },
      });
      if (duplicate !== null) {
        throw new AppError({
          code: ErrorCode.CONFLICT,
          message: 'Track is already in this playlist',
          httpStatus: HttpStatus.CONFLICT,
        });
      }

      const aggregate = await tx.userPlaylistTrack.aggregate({
        where: { userPlaylistId: playlistId },
        _max: { pos: true },
      });
      const nextPos = (aggregate._max.pos ?? -1) + 1;

      await tx.userPlaylistTrack.create({
        data: { userPlaylistId: playlistId, trackId, pos: nextPos },
      });

      return tx.userPlaylist.update({
        where: { id: playlistId },
        data: { updatedAt: new Date() },
        include: USER_PLAYLIST_INCLUDE,
      });
    });
  }

  async removeTrack(
    userId: number,
    playlistId: number,
    trackId: number,
  ): Promise<UserPlaylistRecord> {
    return this.prisma.transaction(async (tx) => {
      const playlist = await tx.userPlaylist.findFirst({
        where: { id: playlistId, userId },
        select: { id: true },
      });
      if (playlist === null) {
        throw new AppError({
          code: ErrorCode.PLAYLIST_NOT_FOUND,
          message: 'Playlist not found',
          httpStatus: HttpStatus.NOT_FOUND,
        });
      }

      const existing = await tx.userPlaylistTrack.findFirst({
        where: { userPlaylistId: playlistId, trackId },
        select: { pos: true },
      });
      if (existing === null) {
        throw new AppError({
          code: ErrorCode.TRACK_NOT_FOUND,
          message: 'Track is not in this playlist',
          httpStatus: HttpStatus.NOT_FOUND,
        });
      }

      await tx.userPlaylistTrack.deleteMany({
        where: { userPlaylistId: playlistId, trackId },
      });
      await tx.$executeRaw`
        UPDATE user_playlist_tracks
        SET pos = pos - 1
        WHERE user_playlist_id = ${playlistId} AND pos > ${existing.pos}
      `;

      return tx.userPlaylist.update({
        where: { id: playlistId },
        data: { updatedAt: new Date() },
        include: USER_PLAYLIST_INCLUDE,
      });
    });
  }

  async reorderTracks(
    userId: number,
    playlistId: number,
    trackIds: number[],
  ): Promise<UserPlaylistRecord> {
    return this.prisma.transaction(async (tx) => {
      const playlist = await tx.userPlaylist.findFirst({
        where: { id: playlistId, userId },
        select: { id: true },
      });
      if (playlist === null) {
        throw new AppError({
          code: ErrorCode.PLAYLIST_NOT_FOUND,
          message: 'Playlist not found',
          httpStatus: HttpStatus.NOT_FOUND,
        });
      }

      const incomingSet = new Set(trackIds);
      if (incomingSet.size !== trackIds.length) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'trackIds must be unique',
          httpStatus: HttpStatus.BAD_REQUEST,
        });
      }

      const existing = await tx.userPlaylistTrack.findMany({
        where: { userPlaylistId: playlistId },
        select: { trackId: true, addedAt: true },
      });

      if (existing.length !== trackIds.length) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'trackIds must match the current playlist contents',
          httpStatus: HttpStatus.BAD_REQUEST,
        });
      }

      const addedAtByTrackId = new Map<number, Date>();
      for (const row of existing) {
        addedAtByTrackId.set(row.trackId, row.addedAt);
      }
      for (const trackId of trackIds) {
        if (!addedAtByTrackId.has(trackId)) {
          throw new AppError({
            code: ErrorCode.VALIDATION_ERROR,
            message: 'trackIds must match the current playlist contents',
            httpStatus: HttpStatus.BAD_REQUEST,
          });
        }
      }

      await tx.userPlaylistTrack.deleteMany({ where: { userPlaylistId: playlistId } });

      if (trackIds.length > 0) {
        await tx.userPlaylistTrack.createMany({
          data: trackIds.map((trackId, idx) => ({
            userPlaylistId: playlistId,
            trackId,
            pos: idx,
            addedAt: addedAtByTrackId.get(trackId) as Date,
          })),
        });
      }

      return tx.userPlaylist.update({
        where: { id: playlistId },
        data: { updatedAt: new Date() },
        include: USER_PLAYLIST_INCLUDE,
      });
    });
  }
}
