import type { IngestCheckpoint } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { AdminIngestService } from './admin-ingest.service';
import type { AdminIngestRepository } from './admin-ingest.repository';
import type { AuditLogService } from './audit-log.service';

const runIngestMock = vi.hoisted(() => vi.fn());

vi.mock('@statify/db', () => ({
  runIngest: runIngestMock,
}));

function makeCheckpoint(overrides: Partial<IngestCheckpoint> = {}): IngestCheckpoint {
  return {
    id: 1,
    sliceFilename: 'mpd.slice.0-999.json',
    playlistsTotal: 1000,
    playlistsDone: 1000,
    artistsUpserted: 500,
    albumsUpserted: 400,
    tracksUpserted: 6000,
    startedAt: new Date('2026-05-24T00:00:00.000Z'),
    completedAt: new Date('2026-05-24T00:05:00.000Z'),
    errorMessage: null,
    ...overrides,
  };
}

describe('AdminIngestService', () => {
  it('lists checkpoints and reports idle when no run is in progress', async () => {
    const repository = {
      listRecent: vi.fn().mockResolvedValue([makeCheckpoint()]),
    } as unknown as AdminIngestRepository;
    const auditLog = { record: vi.fn() } as unknown as AuditLogService;
    const service = new AdminIngestService({} as never, repository, auditLog);

    const result = await service.list();

    expect(result.running).toBe(false);
    expect(result.startedAt).toBeNull();
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        sliceFilename: 'mpd.slice.0-999.json',
        startedAt: '2026-05-24T00:00:00.000Z',
        completedAt: '2026-05-24T00:05:00.000Z',
      }),
    );
  });

  it('refuses to start a second concurrent run', async () => {
    let resolveRun: (value: unknown) => void = () => undefined;
    runIngestMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRun = resolve;
      }),
    );

    const repository = {
      listRecent: vi.fn().mockResolvedValue([]),
    } as unknown as AdminIngestRepository;
    const auditLog = { record: vi.fn().mockResolvedValue({}) } as unknown as AuditLogService;
    const service = new AdminIngestService({} as never, repository, auditLog);

    const first = await service.trigger(1, { resume: true });
    expect(first.accepted).toBe(true);

    const second = await service.trigger(1, { resume: true });
    expect(second.accepted).toBe(false);
    expect(second.message).toContain('already in progress');

    resolveRun({
      processed: 0,
      skipped: 0,
      totals: { artists: 0, albums: 0, tracks: 0, playlists: 0 },
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(auditLog.record).toHaveBeenCalledTimes(1);
    expect(auditLog.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: 1,
        action: 'admin.ingest.triggered',
        targetTable: 'ingest_checkpoints',
      }),
    );
  });

  it('clears the running flag when the ingest run fails', async () => {
    runIngestMock.mockRejectedValueOnce(new Error('boom'));

    const repository = {
      listRecent: vi.fn().mockResolvedValue([]),
    } as unknown as AdminIngestRepository;
    const auditLog = { record: vi.fn().mockResolvedValue({}) } as unknown as AuditLogService;
    const service = new AdminIngestService({} as never, repository, auditLog);

    await service.trigger(1, { resume: true });
    await new Promise((resolve) => setImmediate(resolve));

    const status = await service.list();
    expect(status.running).toBe(false);
  });
});
