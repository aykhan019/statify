'use client';

import type { AuthUser } from '@statify/shared';
import { Container, Stack, Surface } from '@/components/layout';
import { GlobalSearch } from '@/components/catalog';
import { BrandMarkLink } from '@/components/ui/BrandMarkLink';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MobileNavigation } from './MobileNavigation';
import { UserMenu } from './UserMenu';

export interface TopNavigationProps {
  activePath: string;
  includeAdmin: boolean;
  user: AuthUser;
}

export function TopNavigation({ activePath, includeAdmin, user }: TopNavigationProps) {
  return (
    <Surface
      as="header"
      tone="page"
      border="none"
      radius="none"
      shadow="none"
      padding="none"
      className="sticky top-0 z-30 border-b border-border-default/70 bg-surface-page/82 shadow-[0_14px_44px_-38px_color-mix(in_oklch,var(--section-accent)_65%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-surface-page/70"
    >
      <Container size="full" gutter="none" className="flex h-16 items-center">
        <Stack
          as="div"
          direction="horizontal"
          gap="sm"
          align="center"
          className="min-w-0 shrink-0 pl-4 sm:pl-5 md:w-56 md:pl-6 lg:pl-8 xl:pl-10"
        >
          <MobileNavigation activePath={activePath} includeAdmin={includeAdmin} />
          <BrandMarkLink href="/me" />
        </Stack>
        <div className="hidden min-w-0 flex-1 pl-4 sm:block md:pl-0">
          <GlobalSearch />
        </div>
        <Stack
          as="div"
          direction="horizontal"
          gap="sm"
          align="center"
          justify="end"
          className="ml-auto min-w-0 shrink-0 gap-2 pr-4 sm:pr-5 md:pr-6 lg:pr-8 xl:pr-10"
        >
          <ThemeToggle className="hidden sm:grid" />
          <UserMenu includeAdmin={includeAdmin} user={user} />
        </Stack>
      </Container>
    </Surface>
  );
}
