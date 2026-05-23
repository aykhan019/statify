import { PageHeader } from '@/components/ui/PageHeader';
import { TracksInfiniteList } from '@/components/catalog';
import { fetchTracks } from '@/lib/catalog/api';

export const metadata = {
  title: 'Tracks | Statify',
};

export const dynamic = 'force-dynamic';

export default async function TracksPage() {
  const initial = await fetchTracks({ page: 1 });

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Tracks"
        description={`Browsing ${initial.total.toLocaleString()} tracks from the dataset.`}
      />
      <TracksInfiniteList initial={initial} emptyText="No tracks match this view." />
    </section>
  );
}
