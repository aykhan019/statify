import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/navigation';
import { isAdmin } from '@/lib/auth/admin';
import { getServerSession } from '@/lib/auth/session';
import { fetchHistory } from '@/lib/history/api';

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const currentUser = await getServerSession();

  if (currentUser === null) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const history = await fetchHistory(
    { page: 1, limit: 100 },
    { cookieHeader, cache: 'no-store' },
  ).catch(() => null);

  let stats24h: { minutes: number; trackCount: number } | null = null;
  if (history !== null) {
    const cutoff = Date.now() - DAY_MS;
    const recent = history.data.filter((entry) => {
      const at = Date.parse(entry.playedAt);
      return Number.isFinite(at) && at >= cutoff;
    });
    const totalMs = recent.reduce((sum, entry) => sum + entry.durationPlayedMs, 0);
    const uniqueTracks = new Set(recent.map((entry) => entry.track.id)).size;
    stats24h = { minutes: Math.round(totalMs / 60_000), trackCount: uniqueTracks };
  }

  return (
    <AppShell user={currentUser} includeAdmin={isAdmin(currentUser)} stats24h={stats24h}>
      {children}
    </AppShell>
  );
}
