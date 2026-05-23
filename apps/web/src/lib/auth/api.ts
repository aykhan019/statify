import {
  COOKIE_NAMES,
  HEADERS,
  type AccountDeleteRequest,
  type AuthResponse,
  type LoginRequest,
  type PasswordChangeRequest,
  type RegisterRequest,
} from '@statify/shared';
import { apiFetch } from '../api-client';

const MUTATION_DEFAULTS: RequestInit = {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

export function registerUser(input: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/v1/auth/register', {
    ...MUTATION_DEFAULTS,
    body: JSON.stringify(input),
  });
}

export function loginUser(input: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/v1/auth/login', {
    ...MUTATION_DEFAULTS,
    body: JSON.stringify(input),
  });
}

export function logoutUser(): Promise<void> {
  return apiFetch<void>('/api/v1/auth/logout', {
    ...MUTATION_DEFAULTS,
    headers: withCsrf(MUTATION_DEFAULTS.headers),
  });
}

export function changePassword(input: PasswordChangeRequest): Promise<void> {
  return apiFetch<void>('/api/v1/auth/password', {
    ...MUTATION_DEFAULTS,
    headers: withCsrf(MUTATION_DEFAULTS.headers),
    body: JSON.stringify(input),
  });
}

export function deleteAccount(input: AccountDeleteRequest): Promise<void> {
  return apiFetch<void>('/api/v1/auth/account', {
    ...MUTATION_DEFAULTS,
    method: 'DELETE',
    headers: withCsrf(MUTATION_DEFAULTS.headers),
    body: JSON.stringify(input),
  });
}

function withCsrf(base: HeadersInit | undefined): HeadersInit {
  const headers = new Headers(base);
  const token = readCsrfTokenFromDocument();

  if (token !== null) {
    headers.set(HEADERS.CSRF, token);
  }

  return headers;
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
