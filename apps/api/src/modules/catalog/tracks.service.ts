import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type TrackDetail,
  type TrackListResponse,
  type TracksQuery,
} from '@statify/shared';
import { toOffsetPage } from './catalog.pagination';
import { toTrackDetail, toTrackListItem } from './catalog.mapper';
import { TracksRepository } from './tracks.repository';

@Injectable()
export class TracksService {
  constructor(private readonly repository: TracksRepository) {}

  async list(query: TracksQuery): Promise<TrackListResponse> {
    const result = await this.repository.list(query);

    return toOffsetPage(result.data.map(toTrackListItem), result.total, query);
  }

  async getById(id: number): Promise<TrackDetail> {
    const track = await this.repository.findById(id);

    if (track === null) {
      throw new AppError({
        code: ErrorCode.TRACK_NOT_FOUND,
        message: 'Track not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }

    return toTrackDetail(track);
  }
}
