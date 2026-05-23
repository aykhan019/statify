import { ErrorCode } from '@statify/shared';
import { describe, expect, it, vi } from 'vitest';
import {
  UserPlaylistsRepository,
  type UserPlaylistRecord,
  type UserPlaylistTrackRecord,
} from './user-playlists.repository';
import { UserPlaylistsService } from './user-playlists.service';

describe('UserPlaylistsService', () => {
  it('creates a playlist and returns the mapped detail', async () => {
    const record = createRecord({ name: 'Morning Run' });
    const service = new UserPlaylistsService(
      mockRepository({ create: vi.fn().mockResolvedValue(record) }),
    );

    const result = await service.create(42, {
      name: 'Morning Run',
      description: 'cardio',
      isPublic: false,
    });

    expect(result).toMatchObject({
      id: 1,
      name: 'Morning Run',
      isPublic: false,
      trackCount: 0,
      owner: { id: 42, displayName: 'Tester' },
    });
  });

  it('lists playlists for the owner and applies the pagination envelope', async () => {
    const repository = mockRepository({
      listForOwner: vi.fn().mockResolvedValue({
        data: [createRecord({ id: 1 }), createRecord({ id: 2 })],
        total: 2,
      }),
    });
    const service = new UserPlaylistsService(repository);

    const response = await service.listForOwner(42, { page: 1, limit: 20 });

    expect(repository.listForOwner).toHaveBeenCalledWith(42, { page: 1, limit: 20 });
    expect(response).toMatchObject({ total: 2, page: 1, limit: 20, totalPages: 1 });
    expect(response.data).toHaveLength(2);
  });

  it('returns the playlist detail when the owner requests it', async () => {
    const record = createRecord({ id: 7 });
    const repository = mockRepository({ findOwnedById: vi.fn().mockResolvedValue(record) });
    const service = new UserPlaylistsService(repository);

    await expect(service.getOwnedById(42, 7)).resolves.toMatchObject({ id: 7 });
    expect(repository.findOwnedById).toHaveBeenCalledWith(42, 7);
  });

  it('throws PLAYLIST_NOT_FOUND when the owner check fails', async () => {
    const repository = mockRepository({ findOwnedById: vi.fn().mockResolvedValue(null) });
    const service = new UserPlaylistsService(repository);

    await expect(service.getOwnedById(42, 7)).rejects.toMatchObject({
      code: ErrorCode.PLAYLIST_NOT_FOUND,
    });
  });

  it('lists tracks for the owner with pagination', async () => {
    const repository = mockRepository({
      findOwnedById: vi.fn().mockResolvedValue(createRecord()),
      listTracks: vi.fn().mockResolvedValue({ data: [createTrackRecord()], total: 1 }),
    });
    const service = new UserPlaylistsService(repository);

    const response = await service.listTracks(42, 1, { page: 1, limit: 30 });

    expect(repository.findOwnedById).toHaveBeenCalledWith(42, 1);
    expect(repository.listTracks).toHaveBeenCalledWith(1, { page: 1, limit: 30 });
    expect(response.data[0]?.track.id).toBe(100);
    expect(response.total).toBe(1);
  });

  it('forwards addTrack to the repository', async () => {
    const updated = createRecord({ _count: { tracks: 1 } });
    const repository = mockRepository({ addTrack: vi.fn().mockResolvedValue(updated) });
    const service = new UserPlaylistsService(repository);

    await expect(service.addTrack(42, 1, 100)).resolves.toMatchObject({ trackCount: 1 });
    expect(repository.addTrack).toHaveBeenCalledWith(42, 1, 100);
  });

  it('forwards removeTrack to the repository', async () => {
    const updated = createRecord({ _count: { tracks: 0 } });
    const repository = mockRepository({ removeTrack: vi.fn().mockResolvedValue(updated) });
    const service = new UserPlaylistsService(repository);

    await expect(service.removeTrack(42, 1, 100)).resolves.toMatchObject({ trackCount: 0 });
    expect(repository.removeTrack).toHaveBeenCalledWith(42, 1, 100);
  });

  it('forwards reorderTracks to the repository', async () => {
    const updated = createRecord();
    const repository = mockRepository({ reorderTracks: vi.fn().mockResolvedValue(updated) });
    const service = new UserPlaylistsService(repository);

    await service.reorderTracks(42, 1, [3, 2, 1]);
    expect(repository.reorderTracks).toHaveBeenCalledWith(42, 1, [3, 2, 1]);
  });
});

function mockRepository(overrides: Partial<UserPlaylistsRepository>): UserPlaylistsRepository {
  const base: Partial<UserPlaylistsRepository> = {
    create: vi.fn(),
    listForOwner: vi.fn(),
    findOwnedById: vi.fn(),
    listTracks: vi.fn(),
    addTrack: vi.fn(),
    removeTrack: vi.fn(),
    reorderTracks: vi.fn(),
  };
  return { ...base, ...overrides } as UserPlaylistsRepository;
}

function createRecord(overrides: Partial<UserPlaylistRecord> = {}): UserPlaylistRecord {
  return {
    id: 1,
    userId: 42,
    name: 'Playlist',
    description: null,
    isPublic: false,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
    updatedAt: new Date('2026-05-01T00:00:00.000Z'),
    _count: { tracks: 0 },
    user: { id: 42, displayName: 'Tester' },
    ...overrides,
  };
}

function createTrackRecord(): UserPlaylistTrackRecord {
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
    userPlaylistId: 1,
    pos: 0,
    addedAt: new Date('2026-05-01T00:00:00.000Z'),
    trackId: 100,
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
  };
}
