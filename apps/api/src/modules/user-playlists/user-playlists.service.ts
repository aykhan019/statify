import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type CreateUserPlaylistRequest,
  type UserPlaylistDetail,
  type UserPlaylistListResponse,
  type UserPlaylistTracksQuery,
  type UserPlaylistTracksResponse,
  type UserPlaylistsListQuery,
} from '@statify/shared';
import { toOffsetPage } from '../catalog/catalog.pagination';
import {
  toUserPlaylistDetail,
  toUserPlaylistListItem,
  toUserPlaylistTrackEntry,
} from './user-playlists.mapper';
import { UserPlaylistsRepository } from './user-playlists.repository';

@Injectable()
export class UserPlaylistsService {
  constructor(private readonly repository: UserPlaylistsRepository) {}

  async create(userId: number, input: CreateUserPlaylistRequest): Promise<UserPlaylistDetail> {
    const record = await this.repository.create({
      userId,
      name: input.name,
      description: input.description,
      isPublic: input.isPublic,
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

  async addTrack(userId: number, playlistId: number, trackId: number): Promise<UserPlaylistDetail> {
    const record = await this.repository.addTrack(userId, playlistId, trackId);
    return toUserPlaylistDetail(record);
  }

  async removeTrack(
    userId: number,
    playlistId: number,
    trackId: number,
  ): Promise<UserPlaylistDetail> {
    const record = await this.repository.removeTrack(userId, playlistId, trackId);
    return toUserPlaylistDetail(record);
  }

  async reorderTracks(
    userId: number,
    playlistId: number,
    trackIds: number[],
  ): Promise<UserPlaylistDetail> {
    const record = await this.repository.reorderTracks(userId, playlistId, trackIds);
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
}
