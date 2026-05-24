import { describe, expect, it, vi } from 'vitest';
import {
  runMediaBackfill,
  toCanonicalArtworkUrl,
  type MediaBackfillPrisma,
} from './backfill-media';

describe('media backfill', () => {
  it('updates missing track images and derives album images from the first imaged track', async () => {
    const searchSongs = vi.fn().mockResolvedValue({
      results: [
        {
          artworkUrl100:
            'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a/b/c/example.jpg/100x100bb.jpg',
          previewUrl: 'https://example.com/preview.m4a',
          trackId: 555,
        },
      ],
    });
    const prisma = createPrisma({
      albums: [
        {
          id: 20,
          tracks: [
            {
              imageUrl:
                'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a/b/c/example.jpg/600x600bb.jpg',
            },
          ],
        },
      ],
      tracks: [
        {
          album: { primaryArtist: { name: 'Album Artist' } },
          id: 10,
          name: 'Track',
          trackArtists: [{ artist: { name: 'Primary Artist' }, role: 'primary' }],
        },
      ],
    });

    await expect(runMediaBackfill(prisma, { batchSize: 10, searchSongs })).resolves.toMatchObject({
      albumsUpdated: 1,
      lookupFailures: 0,
      tracksScanned: 1,
      tracksSkipped: 0,
      tracksUpdated: 1,
    });

    expect(searchSongs).toHaveBeenCalledWith({ term: 'Track Primary Artist', limit: 5 });
    expect(prisma.track.update).toHaveBeenCalledWith({
      data: {
        imageUrl:
          'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a/b/c/example.jpg/600x600bb.jpg',
        itunesTrackId: 555n,
        previewFetchedAt: expect.any(Date),
        previewUrl: 'https://example.com/preview.m4a',
      },
      where: { id: 10 },
    });
    expect(prisma.album.update).toHaveBeenCalledWith({
      data: {
        imageUrl:
          'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a/b/c/example.jpg/600x600bb.jpg',
      },
      where: { id: 20 },
    });
  });

  it('is idempotent when tracks and albums already have media', async () => {
    const searchSongs = vi.fn();
    const prisma = createPrisma({ albums: [], tracks: [] });

    await expect(runMediaBackfill(prisma, { batchSize: 10, searchSongs })).resolves.toEqual({
      albumsUpdated: 0,
      lookupFailures: 0,
      tracksScanned: 0,
      tracksSkipped: 0,
      tracksUpdated: 0,
    });

    expect(searchSongs).not.toHaveBeenCalled();
    expect(prisma.track.update).not.toHaveBeenCalled();
    expect(prisma.album.update).not.toHaveBeenCalled();
  });

  it('canonicalizes iTunes artwork URLs to the stored 600px size', () => {
    expect(
      toCanonicalArtworkUrl(
        'https://is4-ssl.mzstatic.com/image/thumb/Music122/v4/a/b/c/example.jpg/100x100bb.jpg',
      ),
    ).toBe('https://is4-ssl.mzstatic.com/image/thumb/Music122/v4/a/b/c/example.jpg/600x600bb.jpg');
  });
});

function createPrisma({
  albums,
  tracks,
}: {
  albums: unknown[];
  tracks: unknown[];
}): MediaBackfillPrisma {
  return {
    album: {
      findMany: vi.fn().mockResolvedValueOnce(albums).mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({}),
    },
    track: {
      findMany: vi.fn().mockResolvedValueOnce(tracks).mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({}),
    },
  } as unknown as MediaBackfillPrisma;
}
