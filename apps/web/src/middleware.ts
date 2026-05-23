import { COOKIE_NAMES } from '@statify/shared';
import { type NextRequest, NextResponse } from 'next/server';
import { getRouteGuardRedirect } from './lib/auth/route-guard';

export function middleware(request: NextRequest) {
  const redirectPath = getRouteGuardRedirect({
    hasAccessCookie: request.cookies.has(COOKIE_NAMES.ACCESS),
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });

  if (redirectPath === null) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|healthz).*)'],
};
