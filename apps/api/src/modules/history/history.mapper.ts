import type { ListeningHistory } from '@prisma/client';
import type { ListeningHistoryEntry } from '@statify/shared';

export function toListeningHistoryEntry(record: ListeningHistory): ListeningHistoryEntry {
  return {
    id: record.id,
    trackId: record.trackId,
    playedAt: record.playedAt.toISOString(),
    source: record.source,
    durationPlayedMs: record.durationPlayedMs,
  };
}
