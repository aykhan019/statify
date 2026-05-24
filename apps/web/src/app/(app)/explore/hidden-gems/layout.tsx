import { Gem } from 'lucide-react';
import type { ReactNode } from 'react';
import { SectionBlockHeader, SectionContent } from '@/components/section';

export default function HiddenGemsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionBlockHeader
        eyebrow="/explore/hidden-gems"
        icon={Gem}
        title="Hidden gems"
        description="Tracks with playlist depth that have not been previewed by any user."
      />
      <SectionContent className="flex flex-col gap-6">{children}</SectionContent>
    </>
  );
}
