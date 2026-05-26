'use client';

import type { AuthUser } from '@statify/shared';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Container, Stack, Surface } from '@/components/layout';
import { AudioPlayer, PlayHistoryReporter } from '@/components/player';
import { SectionProvider } from '@/components/section';
import { Breadcrumbs } from './Breadcrumbs';
import { SideNavigation } from './SideNavigation';
import { TopNavigation } from './TopNavigation';

export interface AppShellProps {
  children: ReactNode;
  includeAdmin: boolean;
  user: AuthUser;
}

export function AppShell({ children, includeAdmin, user }: AppShellProps) {
  const pathname = usePathname();

  return (
    <SectionProvider
      pathname={pathname}
      className="flex min-h-screen flex-col bg-surface-page text-fg-default"
    >
      <TopNavigation activePath={pathname} includeAdmin={includeAdmin} user={user} />
      <Surface
        as="div"
        tone="page"
        border="none"
        radius="none"
        shadow="none"
        padding="none"
        className="flex flex-1"
      >
        <SideNavigation
          activePath={pathname}
          includeAdmin={includeAdmin}
          className="sticky top-16 z-20 h-[calc(100dvh-4rem)] self-start overflow-y-auto"
        />
        <Surface
          as="main"
          tone="work"
          border="none"
          radius="none"
          shadow="none"
          padding="none"
          className="min-w-0 flex-1"
        >
          <Stack as="div" gap="none" className="min-h-full">
            <Container size="wide" gutter="page" className="py-4 sm:py-5">
              <Breadcrumbs activePath={pathname} />
            </Container>
            {children}
          </Stack>
        </Surface>
      </Surface>
      <PlayHistoryReporter />
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center">
        <Container size="prose" gutter="page" className="pointer-events-auto">
          <AudioPlayer />
        </Container>
      </div>
    </SectionProvider>
  );
}
