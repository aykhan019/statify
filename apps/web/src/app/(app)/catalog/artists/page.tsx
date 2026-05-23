import { PageHeader } from '@/components/ui/PageHeader';
import { ArtistsInfiniteList } from '@/components/catalog';
import { fetchArtists } from '@/lib/catalog/api';

export const metadata = {
  title: 'Artists | Statify',
};

export const dynamic = 'force-dynamic';

export default async function ArtistsPage() {
  const initial = await fetchArtists({ page: 1 });

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Artists"
        description={`${initial.total.toLocaleString()} artists in the catalog.`}
      />
      <ArtistsInfiniteList initial={initial} emptyText="No artists yet." />
    </section>
  );
}
