import type { PrismaService } from '../../database/prisma.service';
import { describe, expect, it, vi } from 'vitest';
import { ItunesCache } from './itunes.cache';

describe('ItunesCache', () => {
  it('loads the track context needed for preview lookup', async () => {
    const track = {
      findUnique: vi.fn().mockResolvedValue(null),
    };
    const cache = new ItunesCache({ track } as unknown as PrismaService);

    await cache.findTrackForPreview(1);

    expect(track.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          album: expect.any(Object),
          trackArtists: expect.any(Object),
        }),
        where: { id: 1 },
      }),
    );
  });

  it('persists successful preview lookups on the track row', async () => {
    const fetchedAt = new Date('2026-01-01T00:00:00.000Z');
    const track = {
      update: vi.fn().mockResolvedValue({
        id: 1,
        itunesTrackId: 123n,
        previewFetchedAt: fetchedAt,
        previewUrl: 'https://example.com/preview.m4a',
      }),
    };
    const cache = new ItunesCache({ track } as unknown as PrismaService);

    await cache.savePreview(
      1,
      {
        itunesTrackId: 123,
        previewUrl: 'https://example.com/preview.m4a',
      },
      fetchedAt,
    );

    expect(track.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          itunesTrackId: 123n,
          previewFetchedAt: fetchedAt,
          previewUrl: 'https://example.com/preview.m4a',
        },
        where: { id: 1 },
      }),
    );
  });

  it('marks failed lookups as unavailable on the track row', async () => {
    const fetchedAt = new Date('2026-01-01T00:00:00.000Z');
    const track = {
      update: vi.fn().mockResolvedValue({
        id: 1,
        itunesTrackId: null,
        previewFetchedAt: fetchedAt,
        previewUrl: null,
      }),
    };
    const cache = new ItunesCache({ track } as unknown as PrismaService);

    await cache.markUnavailable(1, fetchedAt);

    expect(track.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          itunesTrackId: null,
          previewFetchedAt: fetchedAt,
          previewUrl: null,
        },
        where: { id: 1 },
      }),
    );
  });
});
