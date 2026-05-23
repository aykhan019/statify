import type { PrismaClient } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { chunked, upsertSlice } from './upsert';
import type { NormalizedSlice } from './types';

function buildSlice(): NormalizedSlice {
  return {
    artists: [{ spotifyUri: 'spotify:artist:a1', name: 'A1', normalizedName: 'a1' }],
    albums: [
      {
        spotifyUri: 'spotify:album:al1',
        name: 'Album',
        primaryArtistSpotifyUri: 'spotify:artist:a1',
      },
    ],
    tracks: [
      {
        spotifyUri: 'spotify:track:t1',
        name: 'Track',
        albumSpotifyUri: 'spotify:album:al1',
        durationMs: 200_000,
      },
    ],
    trackArtists: [
      {
        trackSpotifyUri: 'spotify:track:t1',
        artistSpotifyUri: 'spotify:artist:a1',
        role: 'primary',
      },
    ],
    playlists: [
      {
        mpdPid: 42,
        name: 'P',
        collaborative: false,
        modifiedAt: new Date('2026-05-01T00:00:00.000Z'),
        numFollowers: 1,
        numEdits: 1,
        durationMs: 200_000n,
      },
    ],
    playlistTracks: [{ mpdPid: 42, trackSpotifyUri: 'spotify:track:t1', pos: 0 }],
  };
}

function createPrismaStub() {
  return {
    artist: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([{ id: 11, spotifyUri: 'spotify:artist:a1' }]),
    },
    album: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([{ id: 21, spotifyUri: 'spotify:album:al1' }]),
    },
    track: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([{ id: 31, spotifyUri: 'spotify:track:t1' }]),
    },
    trackArtist: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    mpdPlaylist: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([{ id: 91, mpdPid: 42 }]),
    },
    mpdPlaylistTrack: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
}

describe('chunked', () => {
  it('splits an array into batches of the requested size', () => {
    expect([...chunked([1, 2, 3, 4, 5], 2)]).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('rejects a non-positive size', () => {
    expect(() => [...chunked([1, 2, 3], 0)]).toThrow(/batchSize must be > 0/);
  });
});

describe('upsertSlice', () => {
  it('runs createMany + findMany for each entity with skipDuplicates', async () => {
    const prisma = createPrismaStub();
    const counts = await upsertSlice(prisma as unknown as PrismaClient, buildSlice());

    expect(prisma.artist.createMany).toHaveBeenCalledWith({
      data: [{ spotifyUri: 'spotify:artist:a1', name: 'A1', normalizedName: 'a1' }],
      skipDuplicates: true,
    });
    expect(prisma.album.createMany).toHaveBeenCalledWith({
      data: [{ spotifyUri: 'spotify:album:al1', name: 'Album', primaryArtistId: 11 }],
      skipDuplicates: true,
    });
    expect(prisma.track.createMany).toHaveBeenCalledWith({
      data: [
        {
          spotifyUri: 'spotify:track:t1',
          name: 'Track',
          albumId: 21,
          durationMs: 200_000,
        },
      ],
      skipDuplicates: true,
    });
    expect(prisma.trackArtist.createMany).toHaveBeenCalledWith({
      data: [{ trackId: 31, artistId: 11, role: 'primary' }],
      skipDuplicates: true,
    });
    expect(prisma.mpdPlaylistTrack.createMany).toHaveBeenCalledWith({
      data: [{ playlistId: 91, trackId: 31, pos: 0 }],
      skipDuplicates: true,
    });
    expect(counts).toEqual({ artists: 1, albums: 1, tracks: 1, playlists: 1 });
  });

  it('chunks createMany calls when batchSize is smaller than the input', async () => {
    const prisma = createPrismaStub();
    const slice = buildSlice();
    slice.artists.push(
      { spotifyUri: 'spotify:artist:a2', name: 'A2', normalizedName: 'a2' },
      { spotifyUri: 'spotify:artist:a3', name: 'A3', normalizedName: 'a3' },
    );
    prisma.artist.findMany.mockResolvedValue([
      { id: 11, spotifyUri: 'spotify:artist:a1' },
      { id: 12, spotifyUri: 'spotify:artist:a2' },
      { id: 13, spotifyUri: 'spotify:artist:a3' },
    ]);

    await upsertSlice(prisma as unknown as PrismaClient, slice, { batchSize: 2 });

    expect(prisma.artist.createMany).toHaveBeenCalledTimes(2);
  });
});
