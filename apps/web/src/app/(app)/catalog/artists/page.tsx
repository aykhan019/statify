import { PageHeader } from '@/components/ui/PageHeader';
import { ArtistCatalogControls, ArtistsInfiniteList } from '@/components/catalog';
import { fetchArtists } from '@/lib/catalog/api';
import { readArtistListQuery, type CatalogSearchParams } from '@/lib/catalog/query';

export const metadata = {
  title: 'Artists | Statify',
};

export const dynamic = 'force-dynamic';

interface ArtistsPageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function ArtistsPage({ searchParams }: ArtistsPageProps) {
  const { controls, query } = readArtistListQuery(await searchParams);
  const initial = await fetchArtists(query);
  const description =
    controls.q === undefined
      ? `${initial.total.toLocaleString()} artists in the catalog.`
      : `${initial.total.toLocaleString()} artists match "${controls.q}".`;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Artists" description={description} />
      <ArtistCatalogControls values={controls} />
      <ArtistsInfiniteList initial={initial} baseQuery={query} emptyText="No artists yet." />
    </section>
  );
}
