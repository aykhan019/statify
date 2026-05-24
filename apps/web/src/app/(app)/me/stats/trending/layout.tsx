import { TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { SectionBlockHeader, SectionContent } from '@/components/section';

export default function TrendingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionBlockHeader
        eyebrow="/me/stats/trending"
        icon={TrendingUp}
        title="Trending artists"
        description="Artists climbing fastest in your recent listens."
      />
      <SectionContent className="flex flex-col gap-6">{children}</SectionContent>
    </>
  );
}
