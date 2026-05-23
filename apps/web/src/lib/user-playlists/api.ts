import {
  COOKIE_NAMES,
  HEADERS,
  type CreateUserPlaylistRequest,
  type UserPlaylistDetail,
  type UserPlaylistListResponse,
} from '@statify/shared';
import { apiFetch, type ApiFetchOptions } from '../api-client';

type ServerFetchOptions = Pick<ApiFetchOptions, 'cookieHeader' | 'cache' | 'signal'>;

interface ListMineQueryInput {
  page?: number;
  limit?: number;
  q?: string;
}

export function fetchMyPlaylists(
  query: ListMineQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<UserPlaylistListResponse> {
  return apiFetch<UserPlaylistListResponse>(`/api/v1/me/playlists${toQueryString(query)}`, options);
}

export function createMyPlaylist(input: CreateUserPlaylistRequest): Promise<UserPlaylistDetail> {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const csrf = readCsrfTokenFromDocument();
  if (csrf !== null) {
    headers.set(HEADERS.CSRF, csrf);
  }

  return apiFetch<UserPlaylistDetail>('/api/v1/me/playlists', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(input),
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
