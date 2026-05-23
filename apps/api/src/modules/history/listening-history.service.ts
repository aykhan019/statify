import { HttpStatus, Injectable } from '@nestjs/common';
import {
  AppError,
  ErrorCode,
  type ListeningHistoryListResponse,
  type TrackPlayCountResponse,
} from '@statify/shared';
import { toListeningHistoryEntry, toListeningHistoryListItem } from './history.mapper';
import type { RecordListenInput, RecordListenResult } from './history.types';
import { ListeningHistoryRepository } from './listening-history.repository';

@Injectable()
export class ListeningHistoryService {
  constructor(private readonly repository: ListeningHistoryRepository) {}

  async record(input: RecordListenInput): Promise<RecordListenResult> {
    const track = await this.repository.findTrackById(input.trackId);
    if (track === null) {
      throw new AppError({
        code: ErrorCode.TRACK_NOT_FOUND,
        message: 'Track not found',
        httpStatus: HttpStatus.NOT_FOUND,
      });
    }

    const { entry, created } = await this.repository.record(input);

    return {
      entry: toListeningHistoryEntry(entry),
      idempotent: !created,
    };
  }

  async listForUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<ListeningHistoryListResponse> {
    const { data, total } = await this.repository.listForUser(userId, page, limit);

    return {
      data: data.map(toListeningHistoryListItem),
      limit,
      page,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async countByUserAndTrack(userId: number, trackId: number): Promise<TrackPlayCountResponse> {
    const count = await this.repository.countByUserAndTrack(userId, trackId);
    return { trackId, count };
  }
}
