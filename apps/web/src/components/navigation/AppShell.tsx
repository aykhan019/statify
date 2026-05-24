'use client';

import type { AuthUser } from '@statify/shared';
import { usePathname } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { Container, Stack, Surface } from '@/components/layout';
import { AudioPlayer, PlayHistoryReporter } from '@/components/player';
import { Breadcrumbs } from './Breadcrumbs';
import { getSectionHue } from './items';
import { SideNavigation } from './SideNavigation';
import { TopNavigation } from './TopNavigation';

export interface AppShellProps {
  children: ReactNode;
  includeAdmin: boolean;
  user: AuthUser;
}

export function AppShell({ children, includeAdmin, user }: AppShellProps) {
  const pathname = usePathname();
  const sectionStyle = getSectionStyle(getSectionHue(pathname));

  return (
    <Stack
      as="div"
      gap="none"
      className="min-h-screen bg-surface-page text-fg-default"
      style={sectionStyle}
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
        <SideNavigation activePath={pathname} includeAdmin={includeAdmin} />
        <Surface
          as="main"
          tone="work"
          border="none"
          radius="none"
          shadow="none"
          padding="none"
          className="min-w-0 flex-1"
        >
          <Container size="wide" gutter="page" className="py-6 sm:py-8 lg:py-10">
            <Breadcrumbs activePath={pathname} />
            {children}
          </Container>
        </Surface>
      </Surface>
      <PlayHistoryReporter />
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center">
        <Container size="prose" gutter="page" className="pointer-events-auto">
          <AudioPlayer />
        </Container>
      </div>
    </Stack>
  );
}

function getSectionStyle(hue: ReturnType<typeof getSectionHue>): CSSProperties {
  return {
    '--section-block': `var(--color-${hue}-500)`,
    '--section-block-fg': 'var(--fg-on-block)',
    '--section-tint': `var(--color-${hue}-50)`,
    '--section-accent': `var(--color-${hue}-500)`,
    '--section-accent-fg': 'var(--fg-on-block)',
    '--section-row-hover': `var(--color-${hue}-50)`,
    '--section-frame': `var(--color-${hue}-500)`,
  } as CSSProperties;
}
