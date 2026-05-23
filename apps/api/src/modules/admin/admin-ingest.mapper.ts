import type { IngestCheckpoint as PrismaIngestCheckpoint } from '@prisma/client';
import type { IngestCheckpoint } from '@statify/shared';

export function toIngestCheckpoint(row: PrismaIngestCheckpoint): IngestCheckpoint {
  return {
    id: row.id,
    sliceFilename: row.sliceFilename,
    playlistsTotal: row.playlistsTotal,
    playlistsDone: row.playlistsDone,
    artistsUpserted: row.artistsUpserted,
    albumsUpserted: row.albumsUpserted,
    tracksUpserted: row.tracksUpserted,
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt === null ? null : row.completedAt.toISOString(),
    errorMessage: row.errorMessage,
  };
}
