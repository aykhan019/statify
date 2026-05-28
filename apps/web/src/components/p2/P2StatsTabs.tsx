'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

export interface P2StatsTabItem {
  href: string;
  label: string;
  match?: 'exact' | 'prefix';
}

export interface P2StatsTabsProps {
  items: readonly P2StatsTabItem[];
  ariaLabel?: string;
  className?: string;
}

function isActive(pathname: string, item: P2StatsTabItem): boolean {
  const normalized =
    pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (item.match === 'exact') {
    return normalized === item.href;
  }
  return normalized === item.href || normalized.startsWith(`${item.href}/`);
}

export function P2StatsTabs({ items, ariaLabel = 'Stats sections', className }: P2StatsTabsProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-(--radius-sm) border border-border-default bg-surface-sunken/80 p-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex h-8 shrink-0 items-center rounded-(--radius-xs) px-3 text-xs font-semibold motion-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
              active
                ? 'bg-surface-raised text-fg-strong shadow-xs'
                : 'text-fg-muted hover:bg-section-row-hover hover:text-fg-strong',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export const STATS_TAB_ITEMS: readonly P2StatsTabItem[] = [
  { href: '/me/stats', label: 'Overview', match: 'exact' },
  { href: '/me/stats/top-artists', label: 'Top artists' },
  { href: '/me/stats/top-tracks', label: 'Top tracks' },
  { href: '/me/stats/heatmap', label: 'Heatmap' },
  { href: '/me/stats/trending', label: 'Trending' },
];
