import { cookies } from 'next/headers';
import { HistoryInfiniteList } from '@/components/history';
import { fetchHistory } from '@/lib/history/api';

export const metadata = {
  title: 'History | Statify',
};

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const initial = await fetchHistory({ page: 1 }, { cookieHeader, cache: 'no-store' });

  return <HistoryInfiniteList initial={initial} />;
}
