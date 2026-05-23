import { ErrorCode, type MpdPlaylistsQuery } from '@statify/shared';
import { describe, expect, it, vi } from 'vitest';
import {
  MpdPlaylistsRepository,
  type MpdPlaylistListRecord,
  type MpdPlaylistTrackRecord,
} from './mpd-playlists.repository';
import { MpdPlaylistsService } from './mpd-playlists.service';

describe('MpdPlaylistsService', () => {
  it('maps paginated playlist list records, casting BigInt duration to number', async () => {
    const query: MpdPlaylistsQuery = { limit: 10, page: 1, sort: '-numFollowers' };
    const repository = {
      findById: vi.fn(),
      list: vi.fn().mockResolvedValue({ data: [createPlaylistRecord()], total: 1 }),
      listTracks: vi.fn(),
    } as unknown as MpdPlaylistsRepository;
    const service = new MpdPlaylistsService(repository);

    await expect(service.list(query)).resolves.toEqual({
      data: [
        {
          collaborative: false,
          durationMs: 360000,
          id: 1,
          mpdPid: 42,
          name: 'Road Trip',
          numEdits: 3,
          numFollowers: 250,
          trackCount: 18,
        },
      ],
      limit: 10,
      page: 1,
      total: 1,
      totalPages: 1,
    });
  });

  it('maps playlist detail including modifiedAt', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(createPlaylistRecord()),
      list: vi.fn(),
      listTracks: vi.fn(),
    } as unknown as MpdPlaylistsRepository;
    const service = new MpdPlaylistsService(repository);

    await expect(service.getById(1)).resolves.toMatchObject({
      id: 1,
      modifiedAt: '2026-04-10T00:00:00.000Z',
      trackCount: 18,
    });
  });

  it('throws NOT_FOUND when getById receives no record', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(null),
      list: vi.fn(),
      listTracks: vi.fn(),
    } as unknown as MpdPlaylistsRepository;
    const service = new MpdPlaylistsService(repository);

    await expect(service.getById(404)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it('listTracks throws NOT_FOUND when the parent playlist is missing', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(null),
      list: vi.fn(),
      listTracks: vi.fn(),
    } as unknown as MpdPlaylistsRepository;
    const service = new MpdPlaylistsService(repository);

    await expect(service.listTracks(404, { limit: 10, page: 1 })).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it('listTracks returns mapped tracks for an existing playlist', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(createPlaylistRecord()),
      list: vi.fn(),
      listTracks: vi.fn().mockResolvedValue({ data: [createTrackRecord()], total: 1 }),
    } as unknown as MpdPlaylistsRepository;
    const service = new MpdPlaylistsService(repository);

    const response = await service.listTracks(1, { limit: 10, page: 1 });

    expect(response.total).toBe(1);
    expect(response.data[0]?.pos).toBe(0);
    expect(response.data[0]?.track.id).toBe(100);
  });
});

function createPlaylistRecord(): MpdPlaylistListRecord {
  return {
    _count: { tracks: 18 },
    collaborative: false,
    durationMs: 360000n,
    id: 1,
    modifiedAt: new Date('2026-04-10T00:00:00.000Z'),
    mpdPid: 42,
    name: 'Road Trip',
    numEdits: 3,
    numFollowers: 250,
  };
}

function createTrackRecord(): MpdPlaylistTrackRecord {
  const artist = {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 7,
    name: 'Artist',
    normalizedName: 'artist',
    spotifyUri: 'spotify:artist:7',
  };
  const album = {
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    id: 9,
    name: 'Album',
    primaryArtist: artist,
    primaryArtistId: artist.id,
    spotifyUri: 'spotify:album:9',
  };

  return {
    playlistId: 1,
    pos: 0,
    track: {
      album,
      albumId: album.id,
      durationMs: 200000,
      id: 100,
      itunesTrackId: null,
      name: 'Track A',
      previewFetchedAt: null,
      previewUrl: null,
      spotifyUri: 'spotify:track:100',
      trackArtists: [{ artist, artistId: artist.id, role: 'primary' as const, trackId: 100 }],
    },
    trackId: 100,
  };
}
