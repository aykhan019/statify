import {
  COOKIE_NAMES,
  HEADERS,
  type AdminUserListItem,
  type AdminUserListResponse,
  type AuditLogListResponse,
  type IngestRunsListResponse,
  type TriggerIngestRunRequest,
  type TriggerIngestRunResponse,
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
}

export function fetchAuditLog(
  query: AuditLogQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<AuditLogListResponse> {
  return apiFetch<AuditLogListResponse>(`/api/v1/admin/audit-log${toQueryString(query)}`, options);
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
