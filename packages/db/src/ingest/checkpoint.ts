import type { IngestCheckpoint, PrismaClient } from '@prisma/client';
import type { IngestCounts } from './types';

export async function getCheckpoint(
  prisma: PrismaClient,
  sliceFilename: string,
): Promise<IngestCheckpoint | null> {
  return prisma.ingestCheckpoint.findUnique({ where: { sliceFilename } });
}

export async function isComplete(prisma: PrismaClient, sliceFilename: string): Promise<boolean> {
  const row = await getCheckpoint(prisma, sliceFilename);
  return row !== null && row.completedAt !== null;
}

export async function startCheckpoint(
  prisma: PrismaClient,
  sliceFilename: string,
  playlistsTotal: number,
): Promise<IngestCheckpoint> {
  return prisma.ingestCheckpoint.upsert({
    where: { sliceFilename },
    create: { sliceFilename, playlistsTotal },
    update: {
      playlistsTotal,
      playlistsDone: 0,
      artistsUpserted: 0,
      albumsUpserted: 0,
      tracksUpserted: 0,
      startedAt: new Date(),
      completedAt: null,
      errorMessage: null,
    },
  });
}

export async function completeCheckpoint(
  prisma: PrismaClient,
  sliceFilename: string,
  counts: IngestCounts,
): Promise<IngestCheckpoint> {
  return prisma.ingestCheckpoint.update({
    where: { sliceFilename },
    data: {
      playlistsDone: counts.playlists,
      artistsUpserted: counts.artists,
      albumsUpserted: counts.albums,
      tracksUpserted: counts.tracks,
      completedAt: new Date(),
      errorMessage: null,
    },
  });
}

export async function failCheckpoint(
  prisma: PrismaClient,
  sliceFilename: string,
  error: unknown,
): Promise<IngestCheckpoint> {
  return prisma.ingestCheckpoint.update({
    where: { sliceFilename },
    data: { errorMessage: toErrorMessage(error) },
  });
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
