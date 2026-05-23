import type {
  DiscoverResponse,
  HeatmapResponse,
  HiddenGemsResponse,
  SimilarPlaylistsResponse,
  TopArtistsResponse,
  TrendingResponse,
} from '@statify/shared';
import { apiFetch, type ApiFetchOptions } from '../api-client';

type ServerFetchOptions = Pick<ApiFetchOptions, 'cookieHeader' | 'cache' | 'signal'>;

interface LimitOnly {
  limit?: number;
}

interface TrendingInput extends LimitOnly {
  growthThreshold?: number;
}

interface HiddenGemsInput extends LimitOnly {
  minPlaylistCount?: number;
}

export function fetchTopArtists(
  query: LimitOnly = {},
  options: ServerFetchOptions = {},
): Promise<TopArtistsResponse> {
  return apiFetch<TopArtistsResponse>(
    `/api/v1/me/stats/top-artists${toQueryString(query)}`,
    options,
  );
}

export function fetchHeatmap(options: ServerFetchOptions = {}): Promise<HeatmapResponse> {
  return apiFetch<HeatmapResponse>('/api/v1/me/stats/heatmap', options);
}

export function fetchTrending(
  query: TrendingInput = {},
  options: ServerFetchOptions = {},
): Promise<TrendingResponse> {
  return apiFetch<TrendingResponse>(`/api/v1/me/stats/trending${toQueryString(query)}`, options);
}

export function fetchDiscover(
  query: LimitOnly = {},
  options: ServerFetchOptions = {},
): Promise<DiscoverResponse> {
  return apiFetch<DiscoverResponse>(`/api/v1/discover${toQueryString(query)}`, options);
}

export function fetchHiddenGems(
  query: HiddenGemsInput = {},
  options: ServerFetchOptions = {},
): Promise<HiddenGemsResponse> {
  return apiFetch<HiddenGemsResponse>(
    `/api/v1/explore/hidden-gems${toQueryString(query)}`,
    options,
  );
}

export function fetchSimilarPlaylists(
  playlistId: number,
  query: LimitOnly = {},
  options: ServerFetchOptions = {},
): Promise<SimilarPlaylistsResponse> {
  return apiFetch<SimilarPlaylistsResponse>(
    `/api/v1/playlists/${playlistId}/similar${toQueryString(query)}`,
    options,
  );
}

function toQueryString(query: object): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized.length === 0 ? '' : `?${serialized}`;
}
