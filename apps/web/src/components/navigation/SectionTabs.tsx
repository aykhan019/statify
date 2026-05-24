'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

export interface SectionTabItem {
  href: string;
  label: string;
}

export interface SectionTabsProps {
  ariaLabel: string;
  items: readonly SectionTabItem[];
}

export function SectionTabs({ ariaLabel, items }: SectionTabsProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel} className="flex gap-2 border-b border-border-default">
      {items.map((item) => {
        const active = isTabActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
              active
                ? 'border-section-accent text-section-accent'
                : 'border-transparent text-fg-muted hover:bg-section-row-hover hover:text-fg-strong',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function isTabActive(pathname: string, href: string): boolean {
  const normalized = normalizePathname(pathname);
  return normalized === href || normalized.startsWith(`${href}/`);
}

function normalizePathname(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}
