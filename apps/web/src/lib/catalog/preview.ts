import { COOKIE_NAMES, HEADERS, type TrackDetail } from '@statify/shared';
import { apiFetch } from '../api-client';

export function resolveTrackPreview(trackId: number): Promise<TrackDetail> {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  const csrf = readCsrfTokenFromDocument();
  if (csrf !== null) {
    headers.set(HEADERS.CSRF, csrf);
  }

  return apiFetch<TrackDetail>(`/api/v1/tracks/${trackId}/preview`, {
    method: 'POST',
    credentials: 'include',
    headers,
  });
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
