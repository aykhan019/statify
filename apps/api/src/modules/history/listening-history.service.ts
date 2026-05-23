import { HttpStatus, Injectable } from '@nestjs/common';
import { AppError, ErrorCode } from '@statify/shared';
import { toListeningHistoryEntry } from './history.mapper';
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
}
