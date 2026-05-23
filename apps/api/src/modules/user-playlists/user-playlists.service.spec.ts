import { describe, expect, it, vi } from 'vitest';
import { UserPlaylistsRepository, type UserPlaylistRecord } from './user-playlists.repository';
import { UserPlaylistsService } from './user-playlists.service';

describe('UserPlaylistsService', () => {
  it('creates a playlist and returns the mapped detail', async () => {
    const record = createRecord({ name: 'Morning Run' });
    const repository = {
      create: vi.fn().mockResolvedValue(record),
      listForOwner: vi.fn(),
    } as unknown as UserPlaylistsRepository;
    const service = new UserPlaylistsService(repository);

    const result = await service.create(42, {
      name: 'Morning Run',
      description: 'cardio',
      isPublic: false,
    });

    expect(repository.create).toHaveBeenCalledWith({
      userId: 42,
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
    const repository = {
      create: vi.fn(),
      listForOwner: vi.fn().mockResolvedValue({
        data: [createRecord({ id: 1 }), createRecord({ id: 2 })],
        total: 2,
      }),
    } as unknown as UserPlaylistsRepository;
    const service = new UserPlaylistsService(repository);

    const response = await service.listForOwner(42, { page: 1, limit: 20 });

    expect(repository.listForOwner).toHaveBeenCalledWith(42, { page: 1, limit: 20 });
    expect(response).toMatchObject({
      total: 2,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    expect(response.data).toHaveLength(2);
    expect(response.data[0]?.owner.displayName).toBe('Tester');
  });
});

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
