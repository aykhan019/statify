export interface ItunesSearchParams {
  limit?: number;
  term: string;
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesSearchResult[];
}

export interface ItunesSearchResult {
  artistName?: string;
  artworkUrl100?: string;
  collectionName?: string;
  kind?: string;
  previewUrl?: string;
  primaryGenreName?: string;
  trackId?: number;
  trackName?: string;
  wrapperType?: string;
}

export interface ItunesPreviewMatch {
  itunesTrackId: number;
  previewUrl: string;
}
