import { Music2 } from 'lucide-react';
import { TrackCatalogControls, TracksInfiniteList } from '@/components/catalog';
import { SectionContent } from '@/components/section';
import { P2GlassPanel, P2PageHero, P2Pill, P2Toolbar } from '@/components/p2';
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
    <>
      <P2PageHero
        eyebrow="/catalog/tracks"
        icon={Music2}
        title="Tracks, ready to inspect."
        description={description}
        actions={
          <>
            <P2Pill tone="on-block">{controls.q ? 'Query active' : 'All tracks'}</P2Pill>
            <P2Pill tone="on-block">Has preview</P2Pill>
          </>
        }
      />
      <SectionContent className="space-y-5">
        <P2Toolbar>
          <TrackCatalogControls values={controls} />
        </P2Toolbar>
        <P2GlassPanel className="p-3 sm:p-4">
          <TracksInfiniteList
            initial={initial}
            baseQuery={query}
            emptyText="No tracks match this view."
          />
        </P2GlassPanel>
      </SectionContent>
    </>
  );
}
