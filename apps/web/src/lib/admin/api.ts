import {
  COOKIE_NAMES,
  HEADERS,
  type AdminAlbumListItem,
  type AdminAlbumListResponse,
  type AdminArtistListItem,
  type AdminArtistListResponse,
  type AdminTrackListItem,
  type AdminTrackListResponse,
  type AdminUserListItem,
  type AdminUserListResponse,
  type AuditLogListResponse,
  type IngestRunsListResponse,
  type TriggerIngestRunRequest,
  type TriggerIngestRunResponse,
  type UpdateAdminAlbumHiddenRequest,
  type UpdateAdminAlbumRequest,
  type UpdateAdminArtistHiddenRequest,
  type UpdateAdminArtistRequest,
  type UpdateAdminTrackHiddenRequest,
  type UpdateAdminTrackRequest,
  type UpdateUserBanRequest,
  type UpdateUserRoleRequest,
} from '@statify/shared';
import { apiFetch, type ApiFetchOptions } from '../api-client';

type ServerFetchOptions = Pick<ApiFetchOptions, 'cookieHeader' | 'cache' | 'signal'>;

interface UsersListQueryInput {
  page?: number;
  limit?: number;
  q?: string;
}

export function fetchAdminUsers(
  query: UsersListQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<AdminUserListResponse> {
  return apiFetch<AdminUserListResponse>(`/api/v1/admin/users${toQueryString(query)}`, options);
}

export function updateUserRole(
  userId: number,
  input: UpdateUserRoleRequest,
): Promise<AdminUserListItem> {
  return mutate<AdminUserListItem>(`/api/v1/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: input,
  });
}

export function updateUserBan(
  userId: number,
  input: UpdateUserBanRequest,
): Promise<AdminUserListItem> {
  return mutate<AdminUserListItem>(`/api/v1/admin/users/${userId}/ban`, {
    method: 'PATCH',
    body: input,
  });
}

export function fetchIngestRuns(options: ServerFetchOptions = {}): Promise<IngestRunsListResponse> {
  return apiFetch<IngestRunsListResponse>('/api/v1/admin/ingest/runs', options);
}

export function triggerIngestRun(
  input: TriggerIngestRunRequest,
): Promise<TriggerIngestRunResponse> {
  return mutate<TriggerIngestRunResponse>('/api/v1/admin/ingest/runs', {
    method: 'POST',
    body: input,
  });
}

interface AuditLogQueryInput {
  page?: number;
  limit?: number;
  action?: string;
  actorUserId?: number;
  targetTable?: string;
  targetId?: string;
}

export function fetchAuditLog(
  query: AuditLogQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<AuditLogListResponse> {
  return apiFetch<AuditLogListResponse>(`/api/v1/admin/audit-log${toQueryString(query)}`, options);
}

interface CatalogAdminListQueryInput {
  page?: number;
  limit?: number;
  q?: string;
  includeHidden?: boolean;
}

export function fetchAdminArtists(
  query: CatalogAdminListQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<AdminArtistListResponse> {
  return apiFetch<AdminArtistListResponse>(`/api/v1/admin/artists${toQueryString(query)}`, options);
}

export function updateAdminArtist(
  artistId: number,
  input: UpdateAdminArtistRequest,
): Promise<AdminArtistListItem> {
  return mutate<AdminArtistListItem>(`/api/v1/admin/artists/${artistId}`, {
    method: 'PATCH',
    body: input,
  });
}

export function setAdminArtistHidden(
  artistId: number,
  input: UpdateAdminArtistHiddenRequest,
): Promise<AdminArtistListItem> {
  return mutate<AdminArtistListItem>(`/api/v1/admin/artists/${artistId}/hidden`, {
    method: 'PATCH',
    body: input,
  });
}

export function fetchAdminAlbums(
  query: CatalogAdminListQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<AdminAlbumListResponse> {
  return apiFetch<AdminAlbumListResponse>(`/api/v1/admin/albums${toQueryString(query)}`, options);
}

export function updateAdminAlbum(
  albumId: number,
  input: UpdateAdminAlbumRequest,
): Promise<AdminAlbumListItem> {
  return mutate<AdminAlbumListItem>(`/api/v1/admin/albums/${albumId}`, {
    method: 'PATCH',
    body: input,
  });
}

export function setAdminAlbumHidden(
  albumId: number,
  input: UpdateAdminAlbumHiddenRequest,
): Promise<AdminAlbumListItem> {
  return mutate<AdminAlbumListItem>(`/api/v1/admin/albums/${albumId}/hidden`, {
    method: 'PATCH',
    body: input,
  });
}

export function fetchAdminTracks(
  query: CatalogAdminListQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<AdminTrackListResponse> {
  return apiFetch<AdminTrackListResponse>(`/api/v1/admin/tracks${toQueryString(query)}`, options);
}

export function updateAdminTrack(
  trackId: number,
  input: UpdateAdminTrackRequest,
): Promise<AdminTrackListItem> {
  return mutate<AdminTrackListItem>(`/api/v1/admin/tracks/${trackId}`, {
    method: 'PATCH',
    body: input,
  });
}

export function setAdminTrackHidden(
  trackId: number,
  input: UpdateAdminTrackHiddenRequest,
): Promise<AdminTrackListItem> {
  return mutate<AdminTrackListItem>(`/api/v1/admin/tracks/${trackId}/hidden`, {
    method: 'PATCH',
    body: input,
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
