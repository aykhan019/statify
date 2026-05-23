import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type MpdPlaylistDetail,
  type MpdPlaylistListResponse,
  type MpdPlaylistTracksQuery,
  type MpdPlaylistTracksResponse,
  type MpdPlaylistsQuery,
} from '@statify/shared';
import { toOffsetPage } from '../catalog/catalog.pagination';
import {
  toMpdPlaylistDetail,
  toMpdPlaylistListItem,
  toMpdPlaylistTrackEntry,
} from './mpd-playlists.mapper';
import { MpdPlaylistsRepository } from './mpd-playlists.repository';

@Injectable()
export class MpdPlaylistsService {
  constructor(private readonly repository: MpdPlaylistsRepository) {}

  async list(query: MpdPlaylistsQuery): Promise<MpdPlaylistListResponse> {
    const result = await this.repository.list(query);
    return toOffsetPage(result.data.map(toMpdPlaylistListItem), result.total, query);
  }

  async getById(id: number): Promise<MpdPlaylistDetail> {
    const record = await this.repository.findById(id);
    if (record === null) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: 'Playlist not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }
    return toMpdPlaylistDetail(record);
  }

  async listTracks(
    playlistId: number,
    query: MpdPlaylistTracksQuery,
  ): Promise<MpdPlaylistTracksResponse> {
    const playlist = await this.repository.findById(playlistId);
    if (playlist === null) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: 'Playlist not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }
    const result = await this.repository.listTracks(playlistId, query);
    return toOffsetPage(result.data.map(toMpdPlaylistTrackEntry), result.total, query);
  }
}
