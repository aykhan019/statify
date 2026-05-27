import { HEADERS } from '@statify/shared';
import { getApiBaseUrl } from '../config';

/**
 * Exchanges a still-valid refresh cookie for a fresh token set via the API's refresh endpoint.
 * Returns the `Set-Cookie` strings to forward to the browser, or null when refresh is
 * unavailable (no CSRF cookie) or rejected (expired/rotated refresh token).
 *
 * The endpoint is CSRF-guarded (double-submit), so the `sf_csrf` cookie value is echoed back
 * in the `X-CSRF-Token` header.
 */
export async function refreshAuthCookies(
  cookieHeader: string,
  csrfToken: string | undefined,
): Promise<string[] | null> {
  if (cookieHeader.length === 0 || csrfToken === undefined) {
    return null;
  }

  try {
    const response = await fetch(new URL('/api/v1/auth/refresh', getApiBaseUrl()), {
      method: 'POST',
      headers: {
        cookie: cookieHeader,
        [HEADERS.CSRF]: csrfToken,
      },
    });

    if (!response.ok) {
      return null;
    }

    const setCookies = response.headers.getSetCookie();

    return setCookies.length > 0 ? setCookies : null;
  } catch {
    return null;
  }
}

/**
 * Overlays the name=value pairs from fresh `Set-Cookie` strings onto an existing `Cookie`
 * header, so the current request render sees the just-refreshed session.
 */
export function mergeCookieHeader(original: string, setCookies: string[]): string {
  const jar = new Map<string, string>();

  applyPairs(jar, original.split(';'));
  applyPairs(
    jar,
    setCookies.map((setCookie) => setCookie.split(';')[0] ?? ''),
  );

  return Array.from(jar, ([name, value]) => `${name}=${value}`).join('; ');
}

function applyPairs(jar: Map<string, string>, pairs: string[]): void {
  for (const pair of pairs) {
    const index = pair.indexOf('=');

    if (index > 0) {
      jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
    }
  }
}
