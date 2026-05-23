import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { completeCheckpoint, failCheckpoint, isComplete, startCheckpoint } from './checkpoint';

interface IngestCheckpointStub {
  findUnique: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

function createPrisma(): { prisma: PrismaClient; stub: IngestCheckpointStub } {
  const stub: IngestCheckpointStub = {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  };
  return {
    prisma: { ingestCheckpoint: stub } as unknown as PrismaClient,
    stub,
  };
}

describe('isComplete', () => {
  it('returns true when the checkpoint row has completedAt set', async () => {
    const { prisma, stub } = createPrisma();
    stub.findUnique.mockResolvedValue({ completedAt: new Date() });
    await expect(isComplete(prisma, 'mpd.slice.0-999.json')).resolves.toBe(true);
  });

  it('returns false when the checkpoint is missing or unfinished', async () => {
    const { prisma, stub } = createPrisma();
    stub.findUnique.mockResolvedValueOnce(null);
    await expect(isComplete(prisma, 'mpd.slice.0-999.json')).resolves.toBe(false);

    stub.findUnique.mockResolvedValueOnce({ completedAt: null });
    await expect(isComplete(prisma, 'mpd.slice.0-999.json')).resolves.toBe(false);
  });
});

describe('startCheckpoint', () => {
  it('upserts the checkpoint with the playlist total and resets counters on retry', async () => {
    const { prisma, stub } = createPrisma();
    stub.upsert.mockResolvedValue({});

    await startCheckpoint(prisma, 'mpd.slice.0-999.json', 1000);

    expect(stub.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sliceFilename: 'mpd.slice.0-999.json' },
        create: { sliceFilename: 'mpd.slice.0-999.json', playlistsTotal: 1000 },
        update: expect.objectContaining({
          playlistsTotal: 1000,
          playlistsDone: 0,
          completedAt: null,
          errorMessage: null,
        }),
      }),
    );
  });
});

describe('completeCheckpoint', () => {
  it('updates counters and stamps completedAt', async () => {
    const { prisma, stub } = createPrisma();
    stub.update.mockResolvedValue({});

    await completeCheckpoint(prisma, 'mpd.slice.0-999.json', {
      artists: 100,
      albums: 200,
      tracks: 300,
      playlists: 1000,
    });

    expect(stub.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sliceFilename: 'mpd.slice.0-999.json' },
        data: expect.objectContaining({
          playlistsDone: 1000,
          artistsUpserted: 100,
          albumsUpserted: 200,
          tracksUpserted: 300,
          errorMessage: null,
        }),
      }),
    );
  });
});

describe('failCheckpoint', () => {
  it('stores an Error message', async () => {
    const { prisma, stub } = createPrisma();
    stub.update.mockResolvedValue({});

    await failCheckpoint(prisma, 'mpd.slice.0-999.json', new Error('boom'));

    expect(stub.update).toHaveBeenCalledWith({
      where: { sliceFilename: 'mpd.slice.0-999.json' },
      data: { errorMessage: 'boom' },
    });
  });

  it('coerces non-Error values to a string', async () => {
    const { prisma, stub } = createPrisma();
    stub.update.mockResolvedValue({});

    await failCheckpoint(prisma, 'mpd.slice.0-999.json', 'string-error');

    expect(stub.update).toHaveBeenCalledWith({
      where: { sliceFilename: 'mpd.slice.0-999.json' },
      data: { errorMessage: 'string-error' },
    });
  });
});
