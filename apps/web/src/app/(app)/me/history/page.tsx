import { cookies } from 'next/headers';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
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

  return (
    <Container size="md" className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Listening history"
        description={
          initial.total === 0
            ? 'Nothing here yet.'
            : `Your last ${initial.total.toLocaleString()} previewed tracks.`
        }
      />
      <HistoryInfiniteList initial={initial} />
    </Container>
  );
}
