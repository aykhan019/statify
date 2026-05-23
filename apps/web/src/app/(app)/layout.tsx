import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { LogoutButton } from '@/components/auth';
import { GlobalSearch } from '@/components/catalog';
import { AudioPlayer, PlayHistoryReporter } from '@/components/player';
import { Header } from '@/components/ui/Header';
import { Sidebar, type SidebarItem } from '@/components/ui/Sidebar';
import { getServerSession } from '@/lib/auth/session';

const SIDEBAR_ITEMS: SidebarItem[] = [
  { href: '/me', label: 'Overview' },
  { href: '/me/history', label: 'History' },
  { href: '/me/stats', label: 'Stats' },
  { href: '/me/playlists', label: 'Playlists' },
  { href: '/me/account', label: 'Account' },
  { href: '/catalog', label: 'Catalog' },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const currentUser = await getServerSession();

  if (currentUser === null) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        nav={
          <Link
            href="/me"
            className="text-foreground hover:text-accent rounded-(--radius-sm) px-3 py-2 text-sm"
          >
            Dashboard
          </Link>
        }
        actions={
          <div className="flex min-w-0 items-center gap-2">
            <GlobalSearch />
            <Link
              href="/me/account"
              className="text-muted-foreground hover:text-foreground hidden max-w-40 truncate text-sm lg:block"
            >
              {currentUser.displayName}
            </Link>
            <LogoutButton />
          </div>
        }
      />
      <div className="flex flex-1">
        <Sidebar items={SIDEBAR_ITEMS} />
        <main className="flex-1 p-6 sm:p-10">{children}</main>
      </div>
      <PlayHistoryReporter />
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center px-4">
        <div className="pointer-events-auto w-full max-w-3xl">
          <AudioPlayer />
        </div>
      </div>
    </div>
  );
}
