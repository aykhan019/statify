import { CalendarClock } from 'lucide-react';
import type { ReactNode } from 'react';
import { SectionBlockHeader, SectionContent } from '@/components/section';

export default function HeatmapLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SectionBlockHeader
        eyebrow="/me/stats/heatmap"
        icon={CalendarClock}
        title="Listening heatmap"
        description="When you listen, broken out by day of week and hour of day."
      />
      <SectionContent className="flex flex-col gap-6">{children}</SectionContent>
    </>
  );
}
