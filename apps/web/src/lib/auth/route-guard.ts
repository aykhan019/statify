export const AUTH_ROUTES = ['/login', '/signup'] as const;
export const PROTECTED_ROUTE_PREFIXES = ['/admin', '/catalog', '/me', '/playlists'] as const;

interface RouteGuardInput {
  hasAccessCookie: boolean;
  pathname: string;
  search: string;
}

export function getRouteGuardRedirect({
  hasAccessCookie,
  pathname,
  search,
}: RouteGuardInput): string | null {
  if (hasAccessCookie && isAuthPath(pathname)) {
    return '/me';
  }

  if (!hasAccessCookie && isProtectedPath(pathname)) {
    return `/login?next=${encodeURIComponent(`${pathname}${search}`)}`;
  }

  return null;
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => isPathMatch(pathname, route));
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((route) => isPathMatch(pathname, route));
}

function isPathMatch(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}
