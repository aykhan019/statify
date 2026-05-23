import { PageHeader } from '@/components/ui/PageHeader';
import { AlbumsInfiniteList } from '@/components/catalog';
import { fetchAlbums } from '@/lib/catalog/api';

export const metadata = {
  title: 'Albums | Statify',
};

export const dynamic = 'force-dynamic';

export default async function AlbumsPage() {
  const initial = await fetchAlbums({ page: 1 });

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Albums"
        description={`${initial.total.toLocaleString()} albums in the catalog.`}
      />
      <AlbumsInfiniteList initial={initial} emptyText="No albums yet." />
    </section>
  );
}
