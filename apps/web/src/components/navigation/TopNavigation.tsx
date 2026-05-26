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
      className="sticky top-0 z-30 border-b border-border-default bg-surface-page/80 backdrop-blur supports-[backdrop-filter]:bg-surface-page/70"
    >
      <Container size="full" gutter="page" className="flex h-16 items-center justify-between gap-4">
        <Stack as="div" direction="horizontal" gap="sm" align="center" className="min-w-0">
          <MobileNavigation activePath={activePath} includeAdmin={includeAdmin} />
          <BrandMarkLink href="/me" />
        </Stack>
        <Stack
          as="div"
          direction="horizontal"
          gap="sm"
          align="center"
          justify="end"
          className="min-w-0"
        >
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
          <ThemeToggle className="hidden sm:grid" />
          <UserMenu includeAdmin={includeAdmin} user={user} />
        </Stack>
      </Container>
    </Surface>
  );
}
