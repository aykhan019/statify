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
}

export function SideNavigation({
  activePath,
  className,
  forceVisible = false,
  includeAdmin,
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
        'w-48 shrink-0 border-r border-border-default',
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
          />
        ))}
      </nav>
    </Surface>
  );
}
