import { PageHeader } from '@/components/ui/PageHeader';
import { TrackCatalogControls, TracksInfiniteList } from '@/components/catalog';
import { fetchTracks } from '@/lib/catalog/api';
import { readTrackListQuery, type CatalogSearchParams } from '@/lib/catalog/query';

export const metadata = {
  title: 'Tracks | Statify',
};

export const dynamic = 'force-dynamic';

interface TracksPageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function TracksPage({ searchParams }: TracksPageProps) {
  const { controls, query } = readTrackListQuery(await searchParams);
  const initial = await fetchTracks(query);
  const description =
    controls.q === undefined
      ? `Browsing ${initial.total.toLocaleString()} tracks from the dataset.`
      : `${initial.total.toLocaleString()} tracks match "${controls.q}".`;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Tracks" description={description} />
      <TrackCatalogControls values={controls} />
      <TracksInfiniteList
        initial={initial}
        baseQuery={query}
        emptyText="No tracks match this view."
      />
    </section>
  );
}
