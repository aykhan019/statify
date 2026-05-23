export interface SearchTrackRow {
  id: number;
  name: string;
  album_name: string;
  primary_artist_name: string;
  score: number;
}

export interface SearchArtistRow {
  id: number;
  name: string;
  track_count: number;
  score: number;
}

export interface SearchAlbumRow {
  id: number;
  name: string;
  primary_artist_name: string;
  score: number;
}

export interface CatalogSearchRows {
  albums: SearchAlbumRow[];
  artists: SearchArtistRow[];
  tracks: SearchTrackRow[];
}
