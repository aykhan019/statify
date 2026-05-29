import { Injectable } from '@nestjs/common';
import type { CatalogStatsResponse } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CatalogStatsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async counts(): Promise<CatalogStatsResponse> {
    const [tracks, artists, albums, curatedPlaylists, publicUserPlaylists] = await Promise.all([
      this.client.track.count({ where: { hiddenAt: null } }),
      this.client.artist.count({ where: { hiddenAt: null } }),
      this.client.album.count({ where: { hiddenAt: null } }),
      this.client.mpdPlaylist.count(),
      this.client.userPlaylist.count({ where: { isPublic: true } }),
    ]);

    return {
      tracks,
      artists,
      albums,
      playlists: curatedPlaylists + publicUserPlaylists,
    };
  }
}
