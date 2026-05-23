import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type ArtistDetail,
  type ArtistListResponse,
  type ArtistsQuery,
} from '@statify/shared';
import { toArtistDetail, toArtistListItem } from './catalog.mapper';
import { toOffsetPage } from './catalog.pagination';
import { ArtistsRepository } from './artists.repository';

@Injectable()
export class ArtistsService {
  constructor(private readonly repository: ArtistsRepository) {}

  async list(query: ArtistsQuery): Promise<ArtistListResponse> {
    const result = await this.repository.list(query);

    return toOffsetPage(result.data.map(toArtistListItem), result.total, query);
  }

  async getById(id: number): Promise<ArtistDetail> {
    const artist = await this.repository.findById(id);

    if (artist === null) {
      throw new AppError({
        code: ErrorCode.NOT_FOUND,
        message: 'Artist not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }

    return toArtistDetail(artist);
  }
}
