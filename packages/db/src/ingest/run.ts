import type { PrismaClient } from '@prisma/client';
import { completeCheckpoint, failCheckpoint, isComplete, startCheckpoint } from './checkpoint';
import { discoverSlices, type DiscoveredSlice } from './discover';
import { normalizePlaylists } from './normalize';
import { parseSlice } from './parse';
import type { IngestCounts } from './types';
import { upsertSlice } from './upsert';

export interface IngestRunOptions {
  dataDir: string;
  slices: number | null;
  resume: boolean;
  batchSize: number;
  logger?: IngestLogger;
}

export interface IngestLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface IngestRunResult {
  processed: number;
  skipped: number;
  totals: IngestCounts;
}

const SILENT_LOGGER: IngestLogger = {
  info() {},
  warn() {},
  error() {},
};

export async function runIngest(
  prisma: PrismaClient,
  options: IngestRunOptions,
): Promise<IngestRunResult> {
  const logger = options.logger ?? SILENT_LOGGER;
  const available = await discoverSlices(options.dataDir);

  if (available.length === 0) {
    logger.warn(`No MPD slice files found under ${options.dataDir}`);
  }

  const planned = options.slices === null ? available : available.slice(0, options.slices);
  logger.info(
    `Planned ${planned.length} slice(s) (resume=${options.resume}, batchSize=${options.batchSize})`,
  );

  const totals: IngestCounts = { artists: 0, albums: 0, tracks: 0, playlists: 0 };
  let processed = 0;
  let skipped = 0;

  for (const slice of planned) {
    if (options.resume && (await isComplete(prisma, slice.filename))) {
      logger.info(`Skipping ${slice.filename} (already complete)`);
      skipped += 1;
      continue;
    }

    try {
      const counts = await ingestOneSlice(prisma, slice, options.batchSize, logger);
      processed += 1;
      totals.artists += counts.artists;
      totals.albums += counts.albums;
      totals.tracks += counts.tracks;
      totals.playlists += counts.playlists;
    } catch (error) {
      await failCheckpoint(prisma, slice.filename, error);
      logger.error(`Failed ${slice.filename}: ${toErrorMessage(error)}`);
      throw error;
    }
  }

  logger.info(
    `Ingest done. processed=${processed} skipped=${skipped} artists=${totals.artists} albums=${totals.albums} tracks=${totals.tracks} playlists=${totals.playlists}`,
  );

  return { processed, skipped, totals };
}

async function ingestOneSlice(
  prisma: PrismaClient,
  slice: DiscoveredSlice,
  batchSize: number,
  logger: IngestLogger,
): Promise<IngestCounts> {
  const parsed = await parseSlice(slice.path);
  await startCheckpoint(prisma, slice.filename, parsed.playlistCount);

  const playlists = [];
  for await (const playlist of parsed.iterate()) {
    playlists.push(playlist);
  }
  const normalized = normalizePlaylists(playlists);

  const counts = await upsertSlice(prisma, normalized, { batchSize });
  await completeCheckpoint(prisma, slice.filename, counts);

  logger.info(
    `Completed ${slice.filename} (${counts.playlists} playlists, ${counts.tracks} tracks, ${counts.artists} artists)`,
  );

  return counts;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
