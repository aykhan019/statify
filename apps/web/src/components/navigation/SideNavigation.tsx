'use client';

import { usePathname } from 'next/navigation';
import { Surface } from '@/components/layout';
import { cn } from '@/lib/utils/cn';
import { getNavigationItems, isNavigationItemActive } from './items';
import { NavigationLink } from './NavigationLink';

export interface SideNavigationProps {
  activePath?: string;
  className?: string;
  forceVisible?: boolean;
  includeAdmin: boolean;
  stats24h?: { minutes: number; trackCount: number } | null;
}

export function SideNavigation({
  activePath,
  className,
  forceVisible = false,
  includeAdmin,
  stats24h = null,
}: SideNavigationProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const items = getNavigationItems({ includeAdmin });

  return (
    <Surface
      as="aside"
      tone="raised"
      border="none"
      radius="none"
      shadow="none"
      padding="none"
      className={cn(
        forceVisible ? 'flex' : 'hidden md:flex',
        'w-56 shrink-0 flex-col border-r border-border-default/70 bg-surface-raised/76 backdrop-blur-xl supports-[backdrop-filter]:bg-surface-raised/62',
        className,
      )}
      aria-label="Primary"
    >
      <nav className="flex w-full flex-col gap-1 p-3">
        {items.map((item) => (
          <NavigationLink
            key={item.href}
            item={item}
            active={isNavigationItemActive(currentPath, item)}
            className="rounded-(--radius-sm)"
          />
        ))}
      </nav>
      <div className="mt-3 border-t border-border-default/70 px-4 py-4">
        <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-fg-faint uppercase">
          Listening · 24h
        </p>
        <p className="mt-2 text-2xl font-extrabold leading-none tracking-tight text-fg-strong">
          {stats24h !== null ? stats24h.minutes.toLocaleString() : '—'}
          <span className="ml-1 text-xs font-medium text-fg-muted">min</span>
        </p>
        <p className="mt-1 font-mono text-[11px] text-fg-muted">
          {stats24h !== null
            ? `across ${stats24h.trackCount} track${stats24h.trackCount === 1 ? '' : 's'}`
            : 'no plays yet'}
        </p>
      </div>
    </Surface>
  );
}
