import { Clock3 } from 'lucide-react';
import { cookies } from 'next/headers';
import { HistoryExportButton, HistoryInfiniteList } from '@/components/history';
import { SectionContent } from '@/components/section';
import { P2GlassPanel, P2PageHero, P2Pill } from '@/components/p2';
import { fetchHistory } from '@/lib/history/api';

export const metadata = {
  title: 'History | Statify',
};

export const dynamic = 'force-dynamic';

const SOURCE_FILTERS = [
  { id: 'all', label: 'All sources', active: true },
  { id: 'preview', label: 'From a preview' },
  { id: 'playlist', label: 'From a playlist' },
  { id: 'album', label: 'From an album' },
];

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const initial = await fetchHistory({ page: 1 }, { cookieHeader, cache: 'no-store' });

  return (
    <>
      <P2PageHero
        eyebrow="/me/history"
        icon={Clock3}
        title="Every preview leaves a trace."
        description={`${initial.total.toLocaleString()} events captured, ordered newest first.`}
        actions={<HistoryExportButton />}
      />
      <SectionContent className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {SOURCE_FILTERS.map((filter) => (
              <P2Pill key={filter.id} tone={filter.active ? 'section' : 'outline'}>
                {filter.label}
              </P2Pill>
            ))}
          </div>
          <span className="font-mono text-[11px] text-fg-muted tabular-nums">
            last {Math.min(initial.limit, initial.total)} of {initial.total.toLocaleString()} events
          </span>
        </div>

        <P2GlassPanel className="p-4 sm:p-5">
          <HistoryInfiniteList initial={initial} />
        </P2GlassPanel>
      </SectionContent>
    </>
  );
}
