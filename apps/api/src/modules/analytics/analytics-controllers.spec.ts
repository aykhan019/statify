import { describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { AnalyticsService } from './analytics.service';
import { DiscoverController } from './discover.controller';
import { ExploreController } from './explore.controller';
import { PlaylistsSimilarityController } from './playlists-similarity.controller';

const USER: AuthenticatedUser = {
  id: 7,
  email: 'user@example.com',
  displayName: 'User',
  role: 'user',
};

describe('DiscoverController', () => {
  it('forwards the authenticated user id and query', async () => {
    const response = { entries: [] };
    const service = {
      discover: vi.fn().mockResolvedValue(response),
    } as unknown as AnalyticsService;
    const controller = new DiscoverController(service);

    await expect(controller.discover(USER, { limit: 20 })).resolves.toBe(response);
    expect(service.discover).toHaveBeenCalledWith(7, { limit: 20 });
  });
});

describe('PlaylistsSimilarityController', () => {
  it('forwards the playlist id and query', async () => {
    const response = { entries: [] };
    const service = {
      similarPlaylists: vi.fn().mockResolvedValue(response),
    } as unknown as AnalyticsService;
    const controller = new PlaylistsSimilarityController(service);

    await expect(controller.similar(42, { limit: 10 })).resolves.toBe(response);
    expect(service.similarPlaylists).toHaveBeenCalledWith(42, { limit: 10 });
  });
});

describe('ExploreController', () => {
  it('forwards hidden-gems queries to the service', async () => {
    const response = { entries: [] };
    const service = {
      hiddenGems: vi.fn().mockResolvedValue(response),
    } as unknown as AnalyticsService;
    const controller = new ExploreController(service);

    await expect(controller.hiddenGems({ limit: 20, minPlaylistCount: 3 })).resolves.toBe(response);
    expect(service.hiddenGems).toHaveBeenCalledWith({ limit: 20, minPlaylistCount: 3 });
  });
});
