import { describe, expect, it, vi } from 'vitest';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { AnalyticsService } from './analytics.service';
import { MeStatsController } from './me-stats.controller';

const USER: AuthenticatedUser = {
  id: 7,
  email: 'user@example.com',
  displayName: 'User',
  role: 'user',
};

describe('MeStatsController', () => {
  it('forwards top-artists requests with the authenticated user id', async () => {
    const response = { entries: [] };
    const service = {
      topArtists: vi.fn().mockResolvedValue(response),
    } as unknown as AnalyticsService;
    const controller = new MeStatsController(service);

    await expect(controller.topArtists(USER, { limit: 10 })).resolves.toBe(response);
    expect(service.topArtists).toHaveBeenCalledWith(7, { limit: 10 });
  });

  it('forwards top-tracks requests with the authenticated user id', async () => {
    const response = { entries: [] };
    const service = {
      topTracks: vi.fn().mockResolvedValue(response),
    } as unknown as AnalyticsService;
    const controller = new MeStatsController(service);

    await expect(controller.topTracks(USER, { limit: 10 })).resolves.toBe(response);
    expect(service.topTracks).toHaveBeenCalledWith(7, { limit: 10 });
  });

  it('forwards heatmap requests with the authenticated user id', async () => {
    const response = { cells: [] };
    const service = {
      heatmap: vi.fn().mockResolvedValue(response),
    } as unknown as AnalyticsService;
    const controller = new MeStatsController(service);

    await expect(controller.heatmap(USER)).resolves.toBe(response);
    expect(service.heatmap).toHaveBeenCalledWith(7);
  });

  it('forwards trending requests with the authenticated user id and query', async () => {
    const response = { entries: [] };
    const service = {
      trending: vi.fn().mockResolvedValue(response),
    } as unknown as AnalyticsService;
    const controller = new MeStatsController(service);

    await expect(controller.trending(USER, { limit: 5, growthThreshold: 0.5 })).resolves.toBe(
      response,
    );
    expect(service.trending).toHaveBeenCalledWith(7, { limit: 5, growthThreshold: 0.5 });
  });
});
