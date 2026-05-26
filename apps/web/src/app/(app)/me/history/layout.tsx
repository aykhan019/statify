import { History } from 'lucide-react';
import type { ReactNode } from 'react';
import { SectionBlockHeader, SectionContent } from '@/components/section';

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionBlockHeader
        eyebrow="/me/history"
        icon={History}
        title="History"
        description="Your listening activity in reverse chronological order."
      />
      <SectionContent size="wide" className="flex flex-col gap-6">
        {children}
      </SectionContent>
    </>
  );
}
