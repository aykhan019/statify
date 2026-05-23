import type { ListeningHistoryEntry, RecordListenRequest } from '@statify/shared';

export interface RecordListenInput extends RecordListenRequest {
  userId: number;
  idempotencyKey?: string;
}

export interface RecordListenResult {
  entry: ListeningHistoryEntry;
  idempotent: boolean;
}
