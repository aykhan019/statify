import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { runIngest, type IngestLogger } from './run';

let workDir: string;

const SAMPLE_PLAYLIST = {
  pid: 0,
  name: 'P',
  collaborative: 'false',
  modified_at: 1_493_424_000,
  num_followers: 1,
  num_edits: 1,
  duration_ms: 100,
  tracks: [
    {
      pos: 0,
      artist_name: 'A',
      artist_uri: 'spotify:artist:a1',
      track_name: 'T',
      track_uri: 'spotify:track:t1',
      album_name: 'AL',
      album_uri: 'spotify:album:al1',
      duration_ms: 100,
    },
  ],
};

beforeAll(async () => {
  workDir = await mkdtemp(join(tmpdir(), 'statify-run-'));
  await writeFile(
    join(workDir, 'mpd.slice.0-999.json'),
    JSON.stringify({ playlists: [SAMPLE_PLAYLIST] }),
    'utf8',
  );
  await writeFile(
    join(workDir, 'mpd.slice.1000-1999.json'),
    JSON.stringify({ playlists: [{ ...SAMPLE_PLAYLIST, pid: 1 }] }),
    'utf8',
  );
});

afterAll(async () => {
  await rm(workDir, { recursive: true, force: true });
});

interface PrismaStub {
  prisma: PrismaClient;
  isComplete: ReturnType<typeof vi.fn>;
}

function createPrisma(completed: Set<string> = new Set()): PrismaStub {
  const findUnique = vi.fn(({ where }: { where: { sliceFilename: string } }) =>
    Promise.resolve(completed.has(where.sliceFilename) ? { completedAt: new Date() } : null),
  );

  const prisma = {
    ingestCheckpoint: {
      findUnique,
      upsert: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
    },
    artist: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([{ id: 1, spotifyUri: 'spotify:artist:a1' }]),
    },
    album: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([{ id: 1, spotifyUri: 'spotify:album:al1' }]),
    },
    track: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([{ id: 1, spotifyUri: 'spotify:track:t1' }]),
    },
    trackArtist: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    mpdPlaylist: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn(({ where }: { where: { mpdPid: { in: number[] } } }) =>
        Promise.resolve(where.mpdPid.in.map((mpdPid) => ({ id: mpdPid + 1, mpdPid }))),
      ),
    },
    mpdPlaylistTrack: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
  } as unknown as PrismaClient;

  return { prisma, isComplete: findUnique };
}

const SILENT_LOGGER: IngestLogger = { info() {}, warn() {}, error() {} };

describe('runIngest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes every discovered slice when no --slices cap is given', async () => {
    const { prisma } = createPrisma();
    const result = await runIngest(prisma, {
      dataDir: workDir,
      slices: null,
      resume: false,
      batchSize: 500,
      logger: SILENT_LOGGER,
    });

    expect(result.processed).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.totals.playlists).toBe(2);
  });

  it('respects the --slices cap', async () => {
    const { prisma } = createPrisma();
    const result = await runIngest(prisma, {
      dataDir: workDir,
      slices: 1,
      resume: false,
      batchSize: 500,
      logger: SILENT_LOGGER,
    });

    expect(result.processed).toBe(1);
    expect(result.totals.playlists).toBe(1);
  });

  it('skips slices that are already complete when --resume is set', async () => {
    const { prisma } = createPrisma(new Set(['mpd.slice.0-999.json']));
    const result = await runIngest(prisma, {
      dataDir: workDir,
      slices: null,
      resume: true,
      batchSize: 500,
      logger: SILENT_LOGGER,
    });

    expect(result.processed).toBe(1);
    expect(result.skipped).toBe(1);
  });
});
