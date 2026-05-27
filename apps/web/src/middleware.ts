import { COOKIE_NAMES } from '@statify/shared';
import { type NextRequest, NextResponse } from 'next/server';
import { getRouteGuardRedirect } from './lib/auth/route-guard';
import { mergeCookieHeader, refreshAuthCookies } from './lib/auth/session-refresh';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const refreshedCookies = await applySilentRefresh(request, requestHeaders);
  const hasAccessCookie = request.cookies.has(COOKIE_NAMES.ACCESS) || refreshedCookies !== null;

  const redirectPath = getRouteGuardRedirect({
    hasAccessCookie,
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });

  const response =
    redirectPath === null
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : NextResponse.redirect(new URL(redirectPath, request.url));

  // Forward the refreshed cookies to the browser so the next request carries a fresh access token.
  if (refreshedCookies !== null) {
    for (const cookie of refreshedCookies) {
      response.headers.append('set-cookie', cookie);
    }
  }

  return response;
}

/**
 * When the short-lived access cookie has expired but the 30-day refresh cookie is still valid,
 * mints a new token set and rewrites the forwarded `cookie` header so the current render sees it.
 * Prefetch requests are skipped so concurrent link prefetches don't race on the rotating token.
 * Returns the new `Set-Cookie` strings to relay to the browser, or null when no refresh happened.
 */
async function applySilentRefresh(
  request: NextRequest,
  requestHeaders: Headers,
): Promise<string[] | null> {
  const canRefresh =
    !request.cookies.has(COOKIE_NAMES.ACCESS) &&
    request.cookies.has(COOKIE_NAMES.REFRESH) &&
    !isPrefetch(request);

  if (!canRefresh) {
    return null;
  }

  const cookieHeader = request.headers.get('cookie') ?? '';
  const refreshed = await refreshAuthCookies(
    cookieHeader,
    request.cookies.get(COOKIE_NAMES.CSRF)?.value,
  );

  if (refreshed !== null) {
    requestHeaders.set('cookie', mergeCookieHeader(cookieHeader, refreshed));
  }

  return refreshed;
}

function isPrefetch(request: NextRequest): boolean {
  return (
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('sec-purpose')?.includes('prefetch') === true
  );
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|healthz).*)'],
};
