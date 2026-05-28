import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type CreateUserPlaylistRequest,
  type UpdateUserPlaylistRequest,
  type UserPlaylistDetail,
  type UserPlaylistListResponse,
  type UserPlaylistTracksQuery,
  type UserPlaylistTracksResponse,
  type UserPlaylistsListQuery,
} from '@statify/shared';
import { AuditLogService } from '../admin/audit-log.service';
import { toOffsetPage } from '../catalog/catalog.pagination';
import {
  toUserPlaylistDetail,
  toUserPlaylistListItem,
  toUserPlaylistTrackEntry,
} from './user-playlists.mapper';
import { UserPlaylistsRepository } from './user-playlists.repository';

@Injectable()
export class UserPlaylistsService {
  constructor(
    private readonly repository: UserPlaylistsRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(userId: number, input: CreateUserPlaylistRequest): Promise<UserPlaylistDetail> {
    const record = await this.repository.create({
      userId,
      name: input.name,
      description: input.description,
      isPublic: input.isPublic,
    });
    await this.auditLog.record({
      actorUserId: userId,
      action: 'playlist.create',
      targetTable: 'user_playlists',
      targetId: String(record.id),
      metadata: { name: input.name, isPublic: input.isPublic },
    });
    return toUserPlaylistDetail(record);
  }

  async listForOwner(
    userId: number,
    query: UserPlaylistsListQuery,
  ): Promise<UserPlaylistListResponse> {
    const result = await this.repository.listForOwner(userId, query);
    return toOffsetPage(result.data.map(toUserPlaylistListItem), result.total, query);
  }

  async getOwnedById(userId: number, playlistId: number): Promise<UserPlaylistDetail> {
    const record = await this.requireOwned(userId, playlistId);
    return toUserPlaylistDetail(record);
  }

  async listTracks(
    userId: number,
    playlistId: number,
    query: UserPlaylistTracksQuery,
  ): Promise<UserPlaylistTracksResponse> {
    await this.requireOwned(userId, playlistId);
    const result = await this.repository.listTracks(playlistId, query);
    return toOffsetPage(result.data.map(toUserPlaylistTrackEntry), result.total, query);
  }

  async listPublic(query: UserPlaylistsListQuery): Promise<UserPlaylistListResponse> {
    const result = await this.repository.listPublic(query);
    return toOffsetPage(result.data.map(toUserPlaylistListItem), result.total, query);
  }

  async getPublicById(playlistId: number): Promise<UserPlaylistDetail> {
    const record = await this.requirePublic(playlistId);
    return toUserPlaylistDetail(record);
  }

  async listPublicTracks(
    playlistId: number,
    query: UserPlaylistTracksQuery,
  ): Promise<UserPlaylistTracksResponse> {
    await this.requirePublic(playlistId);
    const result = await this.repository.listTracks(playlistId, query);
    return toOffsetPage(result.data.map(toUserPlaylistTrackEntry), result.total, query);
  }

  async update(
    userId: number,
    playlistId: number,
    input: UpdateUserPlaylistRequest,
  ): Promise<UserPlaylistDetail> {
    const description =
      input.description !== undefined && input.description.length > 0 ? input.description : null;
    const record = await this.repository.update(userId, playlistId, {
      name: input.name,
      description,
    });
    await this.auditLog.record({
      actorUserId: userId,
      action: 'playlist.rename',
      targetTable: 'user_playlists',
      targetId: String(playlistId),
      metadata: { name: input.name },
    });
    return toUserPlaylistDetail(record);
  }

  async setVisibility(
    userId: number,
    playlistId: number,
    isPublic: boolean,
  ): Promise<UserPlaylistDetail> {
    const record = await this.repository.setVisibility(userId, playlistId, isPublic);
    await this.auditLog.record({
      actorUserId: userId,
      action: 'playlist.visibility',
      targetTable: 'user_playlists',
      targetId: String(playlistId),
      metadata: { isPublic },
    });
    return toUserPlaylistDetail(record);
  }

  async addTrack(userId: number, playlistId: number, trackId: number): Promise<UserPlaylistDetail> {
    const record = await this.repository.addTrack(userId, playlistId, trackId);
    await this.auditLog.record({
      actorUserId: userId,
      action: 'playlist.track_add',
      targetTable: 'user_playlists',
      targetId: String(playlistId),
      metadata: { trackId },
    });
    return toUserPlaylistDetail(record);
  }

  async removeTrack(
    userId: number,
    playlistId: number,
    trackId: number,
  ): Promise<UserPlaylistDetail> {
    const record = await this.repository.removeTrack(userId, playlistId, trackId);
    await this.auditLog.record({
      actorUserId: userId,
      action: 'playlist.track_remove',
      targetTable: 'user_playlists',
      targetId: String(playlistId),
      metadata: { trackId },
    });
    return toUserPlaylistDetail(record);
  }

  async reorderTracks(
    userId: number,
    playlistId: number,
    trackIds: number[],
  ): Promise<UserPlaylistDetail> {
    const record = await this.repository.reorderTracks(userId, playlistId, trackIds);
    await this.auditLog.record({
      actorUserId: userId,
      action: 'playlist.track_reorder',
      targetTable: 'user_playlists',
      targetId: String(playlistId),
      metadata: { trackCount: trackIds.length },
    });
    return toUserPlaylistDetail(record);
  }

  private async requireOwned(userId: number, playlistId: number) {
    const record = await this.repository.findOwnedById(userId, playlistId);
    if (record === null) {
      throw new AppError({
        code: ErrorCode.PLAYLIST_NOT_FOUND,
        message: 'Playlist not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }
    return record;
  }

  private async requirePublic(playlistId: number) {
    const record = await this.repository.findPublicById(playlistId);
    if (record === null) {
      throw new AppError({
        code: ErrorCode.PLAYLIST_NOT_FOUND,
        message: 'Playlist not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }
    return record;
  }
}
