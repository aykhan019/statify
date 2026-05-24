'use client';

import type { AuthUser } from '@statify/shared';
import Link from 'next/link';
import { Container, Stack, Surface } from '@/components/layout';
import { GlobalSearch } from '@/components/catalog';
import { getTopNavigationItems, isNavigationItemActive } from './items';
import { MobileNavigation } from './MobileNavigation';
import { NavigationLink } from './NavigationLink';
import { UserMenu } from './UserMenu';

export interface TopNavigationProps {
  activePath: string;
  includeAdmin: boolean;
  user: AuthUser;
}

export function TopNavigation({ activePath, includeAdmin, user }: TopNavigationProps) {
  const topItems = getTopNavigationItems({ includeAdmin });

  return (
    <Surface
      as="header"
      tone="page"
      border="none"
      radius="none"
      shadow="none"
      padding="none"
      className="sticky top-0 z-30 border-b border-border-default bg-surface-page/80 backdrop-blur supports-[backdrop-filter]:bg-surface-page/70"
    >
      <Container size="full" gutter="page" className="flex h-16 items-center justify-between gap-4">
        <Stack as="div" direction="horizontal" gap="sm" align="center" className="min-w-0">
          <MobileNavigation activePath={activePath} includeAdmin={includeAdmin} />
          <Link
            href="/me"
            className="text-fg-strong text-base font-semibold tracking-tight hover:text-section-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page"
          >
            Statify
          </Link>
          <nav aria-label="Top primary" className="hidden items-center gap-1 lg:flex">
            {topItems.map((item) => (
              <NavigationLink
                key={item.href}
                item={item}
                active={isNavigationItemActive(activePath, item)}
                variant="top"
              />
            ))}
          </nav>
        </Stack>
        <Stack as="div" direction="horizontal" gap="sm" align="center" className="min-w-0">
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
          <UserMenu includeAdmin={includeAdmin} user={user} />
        </Stack>
      </Container>
    </Surface>
  );
}
