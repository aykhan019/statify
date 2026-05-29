import type { PrismaService } from '../../database/prisma.service';
import { describe, expect, it, vi } from 'vitest';
import { CatalogStatsRepository } from './catalog-stats.repository';

describe('CatalogStatsRepository', () => {
  it('counts visible catalog rows and sums curated + public playlists', async () => {
    const track = { count: vi.fn().mockResolvedValue(180) };
    const artist = { count: vi.fn().mockResolvedValue(46) };
    const album = { count: vi.fn().mockResolvedValue(110) };
    const mpdPlaylist = { count: vi.fn().mockResolvedValue(20) };
    const userPlaylist = { count: vi.fn().mockResolvedValue(4) };

    const repository = new CatalogStatsRepository({
      track,
      artist,
      album,
      mpdPlaylist,
      userPlaylist,
    } as unknown as PrismaService);

    const result = await repository.counts();

    expect(track.count).toHaveBeenCalledWith({ where: { hiddenAt: null } });
    expect(artist.count).toHaveBeenCalledWith({ where: { hiddenAt: null } });
    expect(album.count).toHaveBeenCalledWith({ where: { hiddenAt: null } });
    expect(mpdPlaylist.count).toHaveBeenCalledWith();
    expect(userPlaylist.count).toHaveBeenCalledWith({ where: { isPublic: true } });
    expect(result).toEqual({ tracks: 180, artists: 46, albums: 110, playlists: 24 });
  });
});
