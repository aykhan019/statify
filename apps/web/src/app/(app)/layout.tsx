import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { LogoutButton } from '@/components/auth';
import { GlobalSearch } from '@/components/catalog';
import { Container, Stack, Surface } from '@/components/layout';
import { AudioPlayer, PlayHistoryReporter } from '@/components/player';
import { Sidebar, type SidebarItem } from '@/components/ui/Sidebar';
import { isAdmin } from '@/lib/auth/admin';
import { getServerSession } from '@/lib/auth/session';

const BASE_SIDEBAR_ITEMS: SidebarItem[] = [
  { href: '/me', label: 'Overview' },
  { href: '/me/history', label: 'History' },
  { href: '/me/stats', label: 'Stats' },
  { href: '/discover', label: 'Discover' },
  { href: '/explore/hidden-gems', label: 'Hidden gems' },
  { href: '/me/playlists', label: 'Playlists' },
  { href: '/community/playlists', label: 'Community' },
  { href: '/me/account', label: 'Account' },
  { href: '/catalog', label: 'Catalog' },
];

const ADMIN_SIDEBAR_ITEM: SidebarItem = { href: '/admin', label: 'Admin' };

export default async function AppLayout({ children }: { children: ReactNode }) {
  const currentUser = await getServerSession();

  if (currentUser === null) {
    redirect('/login');
  }

  const sidebarItems = isAdmin(currentUser)
    ? [...BASE_SIDEBAR_ITEMS, ADMIN_SIDEBAR_ITEM]
    : BASE_SIDEBAR_ITEMS;

  return (
    <Stack as="div" gap="none" className="min-h-screen bg-surface-page text-fg-default">
      <Surface
        as="header"
        tone="page"
        border="none"
        radius="none"
        shadow="none"
        padding="none"
        className="sticky top-0 z-30 border-b border-border-default bg-surface-page/80 backdrop-blur supports-[backdrop-filter]:bg-surface-page/70"
      >
        <Container
          size="full"
          gutter="page"
          className="flex h-14 items-center justify-between gap-4"
        >
          <Link
            href="/"
            className="text-fg-strong text-base font-semibold tracking-tight hover:opacity-80"
          >
            Statify
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            <Link
              href="/me"
              className="text-fg-default hover:text-section-accent rounded-(--radius-sm) px-3 py-2 text-sm"
            >
              Dashboard
            </Link>
          </nav>
          <Stack as="div" direction="horizontal" gap="xs" align="center" className="min-w-0">
            <GlobalSearch />
            <Link
              href="/me/account"
              className="text-fg-muted hover:text-fg-default hidden max-w-40 truncate text-sm lg:block"
            >
              {currentUser.displayName}
            </Link>
            <LogoutButton />
          </Stack>
        </Container>
      </Surface>
      <Surface
        as="div"
        tone="page"
        border="none"
        radius="none"
        shadow="none"
        padding="none"
        className="flex flex-1"
      >
        <Sidebar items={sidebarItems} />
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
