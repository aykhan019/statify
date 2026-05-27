import {
  BarChart3,
  Compass,
  Disc3,
  Gem,
  History,
  Home,
  ListMusic,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { getSectionHue } from '@/components/section';
import type { SectionHue } from '@/components/section';
import type { IconProps } from '@/components/ui/Icon';

export { getSectionHue };
export type { SectionHue };

export interface NavigationItem {
  href: string;
  label: string;
  icon: IconProps['as'];
  exact?: boolean;
  adminOnly?: boolean;
  topLevel?: boolean;
}

export interface BreadcrumbItem {
  href: string;
  label: string;
  current: boolean;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: '/me', label: 'Overview', icon: Home, exact: true, topLevel: true },
  { href: '/me/history', label: 'History', icon: History },
  { href: '/me/stats', label: 'Stats', icon: BarChart3, topLevel: true },
  { href: '/discover', label: 'Discover', icon: Compass, exact: true, topLevel: true },
  { href: '/explore/hidden-gems', label: 'Hidden gems', icon: Gem, exact: true },
  { href: '/me/playlists', label: 'Playlists', icon: ListMusic, topLevel: true },
  { href: '/community/playlists', label: 'Community', icon: Users },
  { href: '/catalog', label: 'Catalog', icon: Disc3, topLevel: true },
  { href: '/me/account', label: 'Account', icon: User, exact: true },
  { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
];

const BREADCRUMB_LABELS: Record<string, string> = {
  '/admin': 'Admin',
  '/admin/audit-log': 'Audit log',
  '/admin/ingest': 'Ingest',
  '/admin/users': 'Users',
  '/catalog': 'Catalog',
  '/catalog/albums': 'Albums',
  '/catalog/artists': 'Artists',
  '/catalog/playlists': 'Playlists',
  '/catalog/tracks': 'Tracks',
  '/community': 'Community',
  '/community/playlists': 'Playlists',
  '/discover': 'Discover',
  '/explore': 'Explore',
  '/explore/hidden-gems': 'Hidden gems',
  '/me': 'Overview',
  '/me/account': 'Account',
  '/me/history': 'History',
  '/me/playlists': 'Playlists',
  '/me/playlists/new': 'New playlist',
  '/me/stats': 'Stats',
  '/me/stats/heatmap': 'Heatmap',
  '/me/stats/top-artists': 'Top artists',
  '/me/stats/top-tracks': 'Top tracks',
  '/me/stats/trending': 'Trending',
};

export function getNavigationItems({ includeAdmin }: { includeAdmin: boolean }): NavigationItem[] {
  return NAVIGATION_ITEMS.filter((item) => includeAdmin || item.adminOnly !== true);
}

export function getTopNavigationItems({
  includeAdmin,
}: {
  includeAdmin: boolean;
}): NavigationItem[] {
  return getNavigationItems({ includeAdmin }).filter((item) => item.topLevel === true);
}

export function isNavigationItemActive(pathname: string, item: NavigationItem): boolean {
  const normalized = normalizePathname(pathname);

  if (item.exact === true) {
    return normalized === item.href;
  }

  return normalized === item.href || normalized.startsWith(`${item.href}/`);
}

export function getActiveNavigationItem(
  pathname: string,
  items: NavigationItem[],
): NavigationItem | undefined {
  return items
    .filter((item) => isNavigationItemActive(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length === 0) {
    return [{ href: '/me', label: 'Overview', current: true }];
  }

  let href = '';

  return segments.map((segment, index) => {
    href += `/${segment}`;
    const current = index === segments.length - 1;

    return {
      href,
      label: BREADCRUMB_LABELS[href] ?? formatSegment(segment),
      current,
    };
  });
}

function normalizePathname(pathname: string): string {
  if (pathname === '') {
    return '/';
  }

  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function formatSegment(segment: string): string {
  if (/^\d+$/.test(segment)) {
    return `#${segment}`;
  }

  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
