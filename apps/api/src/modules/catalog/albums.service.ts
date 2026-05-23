import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type AlbumDetail,
  type AlbumListResponse,
  type AlbumsQuery,
} from '@statify/shared';
import { AlbumsRepository } from './albums.repository';
import { toAlbumDetail, toAlbumListItem } from './catalog.mapper';
import { toOffsetPage } from './catalog.pagination';

@Injectable()
export class AlbumsService {
  constructor(private readonly repository: AlbumsRepository) {}

  async list(query: AlbumsQuery): Promise<AlbumListResponse> {
    const result = await this.repository.list(query);

    return toOffsetPage(result.data.map(toAlbumListItem), result.total, query);
  }

  async getById(id: number): Promise<AlbumDetail> {
    const album = await this.repository.findById(id);

    if (album === null) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: 'Album not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }

    return toAlbumDetail(album);
  }
}
