import { describe, expect, it } from 'vitest';
import {
  getBreadcrumbItems,
  getNavigationItems,
  getSectionHue,
  isNavigationItemActive,
} from './items';

describe('navigation items', () => {
  it('keeps overview exact so nested /me routes can use their own active item', () => {
    const items = getNavigationItems({ includeAdmin: false });
    const overview = items.find((item) => item.href === '/me');
    const stats = items.find((item) => item.href === '/me/stats');

    expect(overview).toBeDefined();
    expect(stats).toBeDefined();
    expect(isNavigationItemActive('/me/stats/top-artists', overview!)).toBe(false);
    expect(isNavigationItemActive('/me/stats/top-artists', stats!)).toBe(true);
  });

  it('hides admin navigation from non-admin users', () => {
    expect(getNavigationItems({ includeAdmin: false }).some((item) => item.href === '/admin')).toBe(
      false,
    );
    expect(getNavigationItems({ includeAdmin: true }).some((item) => item.href === '/admin')).toBe(
      true,
    );
  });

  it('builds readable breadcrumbs for nested and dynamic routes', () => {
    expect(getBreadcrumbItems('/catalog/tracks/42')).toEqual([
      { href: '/catalog', label: 'Catalog', current: false },
      { href: '/catalog/tracks', label: 'Tracks', current: false },
      { href: '/catalog/tracks/42', label: '#42', current: true },
    ]);
  });

  it('resolves the section hue from the most specific route prefix', () => {
    expect(getSectionHue('/me/stats/top-tracks')).toBe('magenta');
    expect(getSectionHue('/me/stats')).toBe('coral');
    expect(getSectionHue('/admin/users')).toBe('pink');
  });
});
