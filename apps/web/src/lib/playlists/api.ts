import type {
  MpdPlaylistDetail,
  MpdPlaylistListResponse,
  MpdPlaylistTracksResponse,
} from '@statify/shared';
import { apiFetch, type ApiFetchOptions } from '../api-client';

type ServerFetchOptions = Pick<ApiFetchOptions, 'cookieHeader' | 'cache' | 'signal'>;

interface PlaylistsQueryInput {
  page?: number;
  limit?: number;
  q?: string;
  sort?: 'name' | '-name' | 'numFollowers' | '-numFollowers';
}

interface TracksQueryInput {
  page?: number;
  limit?: number;
}

export function fetchPlaylists(
  query: PlaylistsQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<MpdPlaylistListResponse> {
  return apiFetch<MpdPlaylistListResponse>(`/api/v1/playlists${toQueryString(query)}`, options);
}

export function fetchPlaylistDetail(
  id: number,
  options: ServerFetchOptions = {},
): Promise<MpdPlaylistDetail> {
  return apiFetch<MpdPlaylistDetail>(`/api/v1/playlists/${id}`, options);
}

export function fetchPlaylistTracks(
  id: number,
  query: TracksQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<MpdPlaylistTracksResponse> {
  return apiFetch<MpdPlaylistTracksResponse>(
    `/api/v1/playlists/${id}/tracks${toQueryString(query)}`,
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
