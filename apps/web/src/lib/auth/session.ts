import { AuthResponseSchema, COOKIE_NAMES, type AuthUser } from '@statify/shared';
import { cookies } from 'next/headers';
import { ApiClientError, apiFetch } from '../api-client';

export async function getServerSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  if (!cookieStore.has(COOKIE_NAMES.ACCESS)) {
    return null;
  }

  return getSessionFromCookieHeader(cookieStore.toString());
}

export async function getSessionFromCookieHeader(cookieHeader: string): Promise<AuthUser | null> {
  if (cookieHeader.trim().length === 0) {
    return null;
  }

  try {
    const body = await apiFetch<unknown>('/api/v1/auth/me', {
      cache: 'no-store',
      cookieHeader,
    });

    return AuthResponseSchema.parse(body).user;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null;
    }

    throw error;
  }
}
