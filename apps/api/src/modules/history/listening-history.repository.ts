import { Injectable } from '@nestjs/common';
import type { ListeningHistory, Track } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import type { RecordListenInput } from './history.types';

const UNIQUE_CONSTRAINT_ERROR = 'P2002';

export interface RecordListenPersistResult {
  entry: ListeningHistory;
  created: boolean;
}

@Injectable()
export class ListeningHistoryRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findTrackById(trackId: number): Promise<Track | null> {
    return this.client.track.findUnique({ where: { id: trackId } });
  }

  findByIdempotencyKey(userId: number, idempotencyKey: string): Promise<ListeningHistory | null> {
    return this.client.listeningHistory.findUnique({
      where: { userId_idempotencyKey: { userId, idempotencyKey } },
    });
  }

  async record(input: RecordListenInput): Promise<RecordListenPersistResult> {
    if (input.idempotencyKey === undefined) {
      const entry = await this.client.listeningHistory.create({
        data: buildCreateData(input),
      });

      return { entry, created: true };
    }

    const existing = await this.findByIdempotencyKey(input.userId, input.idempotencyKey);
    if (existing !== null) {
      return { entry: existing, created: false };
    }

    try {
      const entry = await this.client.listeningHistory.create({
        data: buildCreateData(input),
      });

      return { entry, created: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR
      ) {
        const raced = await this.findByIdempotencyKey(input.userId, input.idempotencyKey);
        if (raced !== null) {
          return { entry: raced, created: false };
        }
      }
      throw error;
    }
  }
}

function buildCreateData(input: RecordListenInput) {
  return {
    userId: input.userId,
    trackId: input.trackId,
    source: input.source,
    durationPlayedMs: input.durationPlayedMs,
    playedAt: input.playedAt === undefined ? new Date() : new Date(input.playedAt),
    idempotencyKey: input.idempotencyKey ?? null,
  };
}
