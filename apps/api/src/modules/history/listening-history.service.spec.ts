import type { ListeningHistory, Track } from '@prisma/client';
import { ErrorCode } from '@statify/shared';
import { describe, expect, it, vi } from 'vitest';
import { ListeningHistoryRepository } from './listening-history.repository';
import { ListeningHistoryService } from './listening-history.service';

describe('ListeningHistoryService', () => {
  it('records a listen and maps the persisted row', async () => {
    const entry: ListeningHistory = {
      id: 42,
      userId: 1,
      trackId: 10,
      playedAt: new Date('2026-05-23T10:00:00.000Z'),
      source: 'preview',
      durationPlayedMs: 30_000,
      idempotencyKey: null,
    };
    const repository = createRepository({
      findTrackById: vi.fn().mockResolvedValue({ id: 10 } as Track),
      record: vi.fn().mockResolvedValue({ entry, created: true }),
    });
    const service = new ListeningHistoryService(repository);

    await expect(
      service.record({
        userId: 1,
        trackId: 10,
        source: 'preview',
        durationPlayedMs: 30_000,
      }),
    ).resolves.toEqual({
      entry: {
        id: 42,
        trackId: 10,
        playedAt: '2026-05-23T10:00:00.000Z',
        source: 'preview',
        durationPlayedMs: 30_000,
      },
      idempotent: false,
    });
  });

  it('marks the response as idempotent when the row already existed', async () => {
    const entry: ListeningHistory = {
      id: 1,
      userId: 1,
      trackId: 10,
      playedAt: new Date('2026-05-23T10:00:00.000Z'),
      source: 'preview',
      durationPlayedMs: 30_000,
      idempotencyKey: 'abc',
    };
    const repository = createRepository({
      findTrackById: vi.fn().mockResolvedValue({ id: 10 } as Track),
      record: vi.fn().mockResolvedValue({ entry, created: false }),
    });
    const service = new ListeningHistoryService(repository);

    const result = await service.record({
      userId: 1,
      trackId: 10,
      source: 'preview',
      durationPlayedMs: 30_000,
      idempotencyKey: 'abc',
    });

    expect(result.idempotent).toBe(true);
  });

  it('returns paginated listens with track shape for the user', async () => {
    const repository = createRepository({
      listForUser: vi.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            userId: 1,
            trackId: 10,
            playedAt: new Date('2026-05-23T10:00:00.000Z'),
            source: 'preview',
            durationPlayedMs: 30_000,
            idempotencyKey: null,
            track: {
              id: 10,
              imageUrl: 'https://example.com/track.jpg',
              name: 'Track A',
              durationMs: 180_000,
              previewUrl: null,
              album: {
                id: 5,
                imageUrl: 'https://example.com/album.jpg',
                name: 'Album',
                spotifyUri: 'spotify:album:5',
                primaryArtist: {
                  id: 3,
                  imageUrl: null,
                  name: 'Artist',
                  spotifyUri: 'spotify:artist:3',
                },
              },
              trackArtists: [
                {
                  role: 'primary',
                  artist: {
                    id: 3,
                    imageUrl: null,
                    name: 'Artist',
                    spotifyUri: 'spotify:artist:3',
                  },
                },
              ],
            },
          },
        ],
        total: 1,
      }),
    });
    const service = new ListeningHistoryService(repository);

    const result = await service.listForUser(1, 1, 20);

    expect(result).toMatchObject({
      data: [
        {
          id: 1,
          trackId: 10,
          track: {
            id: 10,
            name: 'Track A',
            album: { id: 5, name: 'Album' },
            artists: [{ id: 3, role: 'primary' }],
          },
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it('returns the play count for a user and track', async () => {
    const repository = createRepository({
      countByUserAndTrack: vi.fn().mockResolvedValue(7),
    });
    const service = new ListeningHistoryService(repository);

    await expect(service.countByUserAndTrack(1, 10)).resolves.toEqual({ trackId: 10, count: 7 });
  });

  it('rejects unknown tracks with TRACK_NOT_FOUND', async () => {
    const record = vi.fn();
    const repository = createRepository({
      findTrackById: vi.fn().mockResolvedValue(null),
      record,
    });
    const service = new ListeningHistoryService(repository);

    await expect(
      service.record({
        userId: 1,
        trackId: 999,
        source: 'preview',
        durationPlayedMs: 0,
      }),
    ).rejects.toMatchObject({ code: ErrorCode.TRACK_NOT_FOUND });
    expect(record).not.toHaveBeenCalled();
  });
});

function createRepository(
  overrides: Partial<ListeningHistoryRepository>,
): ListeningHistoryRepository {
  return overrides as unknown as ListeningHistoryRepository;
}
