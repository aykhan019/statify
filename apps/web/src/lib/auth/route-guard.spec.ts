import { describe, expect, it } from 'vitest';
import { getRouteGuardRedirect, isAuthPath, isProtectedPath } from './route-guard';

describe('route guard', () => {
  it('redirects signed-out users away from protected routes', () => {
    expect(
      getRouteGuardRedirect({
        hasAccessCookie: false,
        pathname: '/me/playlists',
        search: '?tab=public',
      }),
    ).toBe('/login?next=%2Fme%2Fplaylists%3Ftab%3Dpublic');
  });

  it('redirects signed-in users away from auth routes', () => {
    expect(
      getRouteGuardRedirect({
        hasAccessCookie: true,
        pathname: '/login',
        search: '',
      }),
    ).toBe('/me');
  });

  it('allows public and correctly authenticated routes through', () => {
    expect(
      getRouteGuardRedirect({
        hasAccessCookie: false,
        pathname: '/',
        search: '',
      }),
    ).toBeNull();
    expect(
      getRouteGuardRedirect({
        hasAccessCookie: true,
        pathname: '/catalog',
        search: '',
      }),
    ).toBeNull();
  });

  it('matches auth and protected path prefixes exactly', () => {
    expect(isAuthPath('/signup/details')).toBe(true);
    expect(isAuthPath('/signups')).toBe(false);
    expect(isProtectedPath('/playlists/123')).toBe(true);
    expect(isProtectedPath('/playlist')).toBe(false);
  });
});
