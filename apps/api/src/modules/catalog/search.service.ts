import { Injectable } from '@nestjs/common';
import type {
  CatalogSearchAlbumResult,
  CatalogSearchArtistResult,
  CatalogSearchQuery,
  CatalogSearchResponse,
  CatalogSearchTrackResult,
} from '@statify/shared';
import { SearchRepository } from './search.repository';
import type { SearchAlbumRow, SearchArtistRow, SearchTrackRow } from './search.types';

@Injectable()
export class SearchService {
  constructor(private readonly repository: SearchRepository) {}

  async search(query: CatalogSearchQuery): Promise<CatalogSearchResponse> {
    const rows = await this.repository.search(query);

    return {
      albums: rows.albums.map(toAlbumResult),
      artists: rows.artists.map(toArtistResult),
      tracks: rows.tracks.map(toTrackResult),
    };
  }
}

function toTrackResult(row: SearchTrackRow): CatalogSearchTrackResult {
  return {
    albumName: row.album_name,
    id: row.id,
    imageUrl: row.image_url,
    name: row.name,
    primaryArtistName: row.primary_artist_name,
    score: row.score,
  };
}

function toArtistResult(row: SearchArtistRow): CatalogSearchArtistResult {
  return {
    id: row.id,
    imageUrl: row.image_url,
    name: row.name,
    score: row.score,
    trackCount: row.track_count,
  };
}

function toAlbumResult(row: SearchAlbumRow): CatalogSearchAlbumResult {
  return {
    id: row.id,
    imageUrl: row.image_url,
    name: row.name,
    primaryArtistName: row.primary_artist_name,
    score: row.score,
  };
}
