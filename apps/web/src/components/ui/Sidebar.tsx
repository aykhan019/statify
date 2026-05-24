import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface SidebarItem {
  href: string;
  label: ReactNode;
  icon?: ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  activeHref?: string;
  className?: string;
}

export function Sidebar({ items, activeHref, className }: SidebarProps) {
  return (
    <aside
      className={cn('bg-surface hidden w-56 shrink-0 border-r md:flex md:flex-col', className)}
      aria-label="Sections"
    >
      <nav className="flex flex-col gap-1 p-3">
        {items.map((item) => {
          const isActive = activeHref !== undefined && isHrefActive(activeHref, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-(--radius-sm) px-3 py-2 text-sm motion-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.icon !== undefined && <span aria-hidden="true">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function isHrefActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
