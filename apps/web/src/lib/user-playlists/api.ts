import {
  COOKIE_NAMES,
  HEADERS,
  type CreateUserPlaylistRequest,
  type UserPlaylistDetail,
  type UserPlaylistListResponse,
  type UserPlaylistTracksResponse,
} from '@statify/shared';
import { apiFetch, type ApiFetchOptions } from '../api-client';

type ServerFetchOptions = Pick<ApiFetchOptions, 'cookieHeader' | 'cache' | 'signal'>;

interface ListMineQueryInput {
  page?: number;
  limit?: number;
  q?: string;
}

interface TracksQueryInput {
  page?: number;
  limit?: number;
}

export function fetchMyPlaylists(
  query: ListMineQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<UserPlaylistListResponse> {
  return apiFetch<UserPlaylistListResponse>(`/api/v1/me/playlists${toQueryString(query)}`, options);
}

export function fetchMyPlaylistDetail(
  id: number,
  options: ServerFetchOptions = {},
): Promise<UserPlaylistDetail> {
  return apiFetch<UserPlaylistDetail>(`/api/v1/me/playlists/${id}`, options);
}

export function fetchMyPlaylistTracks(
  id: number,
  query: TracksQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<UserPlaylistTracksResponse> {
  return apiFetch<UserPlaylistTracksResponse>(
    `/api/v1/me/playlists/${id}/tracks${toQueryString(query)}`,
    options,
  );
}

export function createMyPlaylist(input: CreateUserPlaylistRequest): Promise<UserPlaylistDetail> {
  return mutate<UserPlaylistDetail>('/api/v1/me/playlists', {
    method: 'POST',
    body: input,
  });
}

export function addPlaylistTrack(playlistId: number, trackId: number): Promise<UserPlaylistDetail> {
  return mutate<UserPlaylistDetail>(`/api/v1/me/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: { trackId },
  });
}

export function removePlaylistTrack(
  playlistId: number,
  trackId: number,
): Promise<UserPlaylistDetail> {
  return mutate<UserPlaylistDetail>(`/api/v1/me/playlists/${playlistId}/tracks/${trackId}`, {
    method: 'DELETE',
  });
}

export function reorderPlaylistTracks(
  playlistId: number,
  trackIds: number[],
): Promise<UserPlaylistDetail> {
  return mutate<UserPlaylistDetail>(`/api/v1/me/playlists/${playlistId}/tracks/order`, {
    method: 'PATCH',
    body: { trackIds },
  });
}

function mutate<T>(path: string, options: { method: string; body?: unknown }): Promise<T> {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const csrf = readCsrfTokenFromDocument();
  if (csrf !== null) {
    headers.set(HEADERS.CSRF, csrf);
  }

  return apiFetch<T>(path, {
    method: options.method,
    credentials: 'include',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
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

function readCsrfTokenFromDocument(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const prefix = `${COOKIE_NAMES.CSRF}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}
