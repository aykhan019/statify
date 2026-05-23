import { PageHeader } from '@/components/ui/PageHeader';
import { AlbumCatalogControls, AlbumsInfiniteList } from '@/components/catalog';
import { fetchAlbums } from '@/lib/catalog/api';
import { readAlbumListQuery, type CatalogSearchParams } from '@/lib/catalog/query';

export const metadata = {
  title: 'Albums | Statify',
};

export const dynamic = 'force-dynamic';

interface AlbumsPageProps {
  searchParams: Promise<CatalogSearchParams>;
}

export default async function AlbumsPage({ searchParams }: AlbumsPageProps) {
  const { controls, query } = readAlbumListQuery(await searchParams);
  const initial = await fetchAlbums(query);
  const description =
    controls.q === undefined
      ? `${initial.total.toLocaleString()} albums in the catalog.`
      : `${initial.total.toLocaleString()} albums match "${controls.q}".`;

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Albums" description={description} />
      <AlbumCatalogControls values={controls} />
      <AlbumsInfiniteList initial={initial} baseQuery={query} emptyText="No albums yet." />
    </section>
  );
}
