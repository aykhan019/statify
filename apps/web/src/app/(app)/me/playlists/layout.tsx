import { ListMusic } from 'lucide-react';
import type { ReactNode } from 'react';
import { SectionBlockHeader, SectionContent } from '@/components/section';

export default function MyPlaylistsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionBlockHeader
        eyebrow="/me/playlists"
        icon={ListMusic}
        title="Playlists"
        description="Create, tune, and publish playlists from your listening library."
      />
      <SectionContent className="flex flex-col gap-6">{children}</SectionContent>
    </>
  );
}
