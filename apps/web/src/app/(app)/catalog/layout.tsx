import { Disc3 } from 'lucide-react';
import type { ReactNode } from 'react';
import { SectionTabs } from '@/components/navigation';
import { SectionBlockHeader, SectionContent } from '@/components/section';

const TABS = [
  { href: '/catalog/tracks', label: 'Tracks' },
  { href: '/catalog/artists', label: 'Artists' },
  { href: '/catalog/albums', label: 'Albums' },
  { href: '/catalog/playlists', label: 'Playlists' },
  { href: '/catalog/genres', label: 'Genres' },
] as const;

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionBlockHeader
        eyebrow="/catalog"
        icon={Disc3}
        title="Library"
        description="Browse tracks, artists, albums, and playlist data from the catalog."
      />
      <SectionContent className="flex flex-col gap-6">
        <SectionTabs ariaLabel="Catalog sections" items={TABS} />
        {children}
      </SectionContent>
    </>
  );
}
