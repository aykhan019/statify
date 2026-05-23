import type {
  AlbumDetail,
  AlbumListResponse,
  AlbumsQuery,
  ArtistDetail,
  ArtistListResponse,
  ArtistsQuery,
  CatalogSearchQuery,
  CatalogSearchResponse,
  TrackDetail,
  TrackListResponse,
  TracksQuery,
} from '@statify/shared';
import { apiFetch, type ApiFetchOptions } from '../api-client';

type ServerFetchOptions = Pick<ApiFetchOptions, 'cookieHeader' | 'cache' | 'signal'>;

type TrackListQuery = Partial<TracksQuery>;
type ArtistListQuery = Partial<ArtistsQuery>;
type AlbumListQuery = Partial<AlbumsQuery>;
type SearchQuery = CatalogSearchQuery;

export function fetchTracks(
  query: TrackListQuery = {},
  options: ServerFetchOptions = {},
): Promise<TrackListResponse> {
  return apiFetch<TrackListResponse>(`/api/v1/tracks${toQueryString(query)}`, options);
}

export function fetchTrackById(id: number, options: ServerFetchOptions = {}): Promise<TrackDetail> {
  return apiFetch<TrackDetail>(`/api/v1/tracks/${id}`, options);
}

export function fetchArtists(
  query: ArtistListQuery = {},
  options: ServerFetchOptions = {},
): Promise<ArtistListResponse> {
  return apiFetch<ArtistListResponse>(`/api/v1/artists${toQueryString(query)}`, options);
}

export function fetchArtistById(
  id: number,
  options: ServerFetchOptions = {},
): Promise<ArtistDetail> {
  return apiFetch<ArtistDetail>(`/api/v1/artists/${id}`, options);
}

export function fetchAlbums(
  query: AlbumListQuery = {},
  options: ServerFetchOptions = {},
): Promise<AlbumListResponse> {
  return apiFetch<AlbumListResponse>(`/api/v1/albums${toQueryString(query)}`, options);
}

export function fetchAlbumById(id: number, options: ServerFetchOptions = {}): Promise<AlbumDetail> {
  return apiFetch<AlbumDetail>(`/api/v1/albums/${id}`, options);
}

export function fetchCatalogSearch(
  query: SearchQuery,
  options: ServerFetchOptions = {},
): Promise<CatalogSearchResponse> {
  return apiFetch<CatalogSearchResponse>(`/api/v1/search${toQueryString(query)}`, options);
}

function toQueryString(query: Record<string, unknown>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }

    params.set(key, String(value));
  }

  const serialized = params.toString();
  return serialized.length === 0 ? '' : `?${serialized}`;
}
