import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { CatalogSearchQuery } from '@statify/shared';
import { BaseRepository } from '../../database/base.repository';
import { PrismaService } from '../../database/prisma.service';
import type {
  CatalogSearchRows,
  SearchAlbumRow,
  SearchArtistRow,
  SearchTrackRow,
} from './search.types';

const MIN_SIMILARITY_SCORE = 0.12;

@Injectable()
export class SearchRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async search(query: CatalogSearchQuery): Promise<CatalogSearchRows> {
    const [tracks, artists, albums] = await Promise.all([
      this.searchTracks(query),
      this.searchArtists(query),
      this.searchAlbums(query),
    ]);

    return { albums, artists, tracks };
  }

  private searchTracks(query: CatalogSearchQuery): Promise<SearchTrackRow[]> {
    return this.client.$queryRaw<SearchTrackRow[]>(Prisma.sql`
      SELECT
        t.id,
        COALESCE(t.image_url, al.image_url) AS image_url,
        t.name,
        al.name AS album_name,
        pa.name AS primary_artist_name,
        similarity(t.name, ${query.q})::float8 AS score
      FROM tracks t
      JOIN albums al ON al.id = t.album_id
      JOIN artists pa ON pa.id = al.primary_artist_id
      WHERE t.name ILIKE ${`%${query.q}%`}
        OR similarity(t.name, ${query.q}) >= ${MIN_SIMILARITY_SCORE}
      ORDER BY score DESC, t.name ASC, t.id ASC
      LIMIT ${query.limit}
    `);
  }

  private searchArtists(query: CatalogSearchQuery): Promise<SearchArtistRow[]> {
    return this.client.$queryRaw<SearchArtistRow[]>(Prisma.sql`
      SELECT
        a.id,
        a.image_url,
        a.name,
        COUNT(ta.track_id)::int AS track_count,
        similarity(a.name, ${query.q})::float8 AS score
      FROM artists a
      LEFT JOIN track_artists ta ON ta.artist_id = a.id
      WHERE a.name ILIKE ${`%${query.q}%`}
        OR similarity(a.name, ${query.q}) >= ${MIN_SIMILARITY_SCORE}
      GROUP BY a.id, a.name
      ORDER BY score DESC, a.name ASC, a.id ASC
      LIMIT ${query.limit}
    `);
  }

  private searchAlbums(query: CatalogSearchQuery): Promise<SearchAlbumRow[]> {
    return this.client.$queryRaw<SearchAlbumRow[]>(Prisma.sql`
      SELECT
        al.id,
        al.image_url,
        al.name,
        pa.name AS primary_artist_name,
        similarity(al.name, ${query.q})::float8 AS score
      FROM albums al
      JOIN artists pa ON pa.id = al.primary_artist_id
      WHERE al.name ILIKE ${`%${query.q}%`}
        OR similarity(al.name, ${query.q}) >= ${MIN_SIMILARITY_SCORE}
      ORDER BY score DESC, al.name ASC, al.id ASC
      LIMIT ${query.limit}
    `);
  }
}
