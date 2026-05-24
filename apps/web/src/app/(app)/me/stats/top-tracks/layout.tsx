import { Music2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { SectionBlockHeader, SectionContent } from '@/components/section';

export default function TopTracksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionBlockHeader
        eyebrow="/me/stats/top-tracks"
        icon={Music2}
        title="Top tracks"
        description="The tracks you replayed most, with play counts and listening time."
      />
      <SectionContent className="flex flex-col gap-6">{children}</SectionContent>
    </>
  );
}
