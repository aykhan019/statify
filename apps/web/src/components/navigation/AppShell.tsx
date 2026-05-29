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
  stats24h?: { minutes: number; trackCount: number } | null;
  user: AuthUser;
}

export function AppShell({ children, includeAdmin, stats24h, user }: AppShellProps) {
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
          stats24h={stats24h ?? null}
          className="sticky top-16 z-20 h-[calc(100dvh-4rem)] self-start overflow-y-auto"
        />
        <Surface
          as="main"
          tone="work"
          border="none"
          radius="none"
          shadow="none"
          padding="none"
          className="relative min-w-0 flex-1 overflow-hidden bg-surface-page"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(color-mix(in oklch, var(--border-default) 60%, transparent) 1px, transparent 1px),
                linear-gradient(90deg, color-mix(in oklch, var(--border-default) 60%, transparent) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
              opacity: 0.45,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(60%_42%_at_10%_0%,color-mix(in_oklch,var(--section-accent)_14%,transparent),transparent_68%),radial-gradient(45%_35%_at_94%_8%,color-mix(in_oklch,var(--section-hue-500)_12%,transparent),transparent_70%)]"
          />
          <Stack as="div" gap="none" className="relative z-10 min-h-full">
            <Container size="wide" gutter="page" className="pt-4 pb-2">
              <Breadcrumbs activePath={pathname} />
            </Container>
            {children}
          </Stack>
        </Surface>
      </Surface>
      <PlayHistoryReporter />
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center">
        <Container
          size="prose"
          gutter="page"
          className="pointer-events-auto max-w-[min(100%,1040px)]"
        >
          <AudioPlayer />
        </Container>
      </div>
    </SectionProvider>
  );
}
