import {
  COOKIE_NAMES,
  HEADERS,
  type ListeningHistoryListResponse,
  type RecordListenRequest,
  type RecordListenResponse,
  type TrackPlayCountResponse,
} from '@statify/shared';
import { apiFetch, type ApiFetchOptions } from '../api-client';

type ServerFetchOptions = Pick<ApiFetchOptions, 'cookieHeader' | 'cache' | 'signal'>;

interface RecordPlayOptions {
  idempotencyKey?: string;
}

export function recordPlay(
  input: RecordListenRequest,
  options: RecordPlayOptions = {},
): Promise<RecordListenResponse> {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const csrf = readCsrfTokenFromDocument();

  if (csrf !== null) {
    headers.set(HEADERS.CSRF, csrf);
  }
  if (options.idempotencyKey !== undefined) {
    headers.set(HEADERS.IDEMPOTENCY, options.idempotencyKey);
  }

  return apiFetch<RecordListenResponse>('/api/v1/me/history', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(input),
  });
}

interface HistoryListQueryInput {
  page?: number;
  limit?: number;
}

export function fetchHistory(
  query: HistoryListQueryInput = {},
  options: ServerFetchOptions = {},
): Promise<ListeningHistoryListResponse> {
  return apiFetch<ListeningHistoryListResponse>(
    `/api/v1/me/history${toQueryString({ ...query })}`,
    options,
  );
}

export function fetchPlayCount(
  trackId: number,
  options: ServerFetchOptions = {},
): Promise<TrackPlayCountResponse> {
  return apiFetch<TrackPlayCountResponse>(`/api/v1/me/history/track/${trackId}/count`, options);
}

function toQueryString(query: Record<string, unknown>): string {
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
