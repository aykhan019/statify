import { CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { HEATMAP_DAYS, HEATMAP_HOURS } from '@statify/shared';
import { SectionContent } from '@/components/section';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/Button';
import {
  P2GlassPanel,
  P2Heatmap,
  P2PageHero,
  P2StatsTabs,
  P2StatTile,
  STATS_TAB_ITEMS,
} from '@/components/p2';
import { fetchHeatmap } from '@/lib/analytics/api';

export const metadata = {
  title: 'Listening heatmap | Statify',
};

export const dynamic = 'force-dynamic';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function asMatrix(
  cells: ReadonlyArray<{ dayOfWeek: number; hourOfDay: number; listenCount: number }>,
): {
  matrix: number[][];
  peak: { day: number; hour: number; count: number };
  quiet: { day: number; hour: number; count: number };
} {
  const matrix: number[][] = Array.from({ length: HEATMAP_DAYS }, () =>
    Array.from({ length: HEATMAP_HOURS }, () => 0),
  );
  let peak = { day: 0, hour: 0, count: -1 };
  let quiet = { day: 0, hour: 0, count: Infinity };
  for (const cell of cells) {
    const day = (cell.dayOfWeek + 6) % 7;
    matrix[day]![cell.hourOfDay] = cell.listenCount;
    if (cell.listenCount > peak.count) {
      peak = { day, hour: cell.hourOfDay, count: cell.listenCount };
    }
    if (cell.listenCount < quiet.count) {
      quiet = { day, hour: cell.hourOfDay, count: cell.listenCount };
    }
  }
  return { matrix, peak, quiet };
}

function describeCell(day: number, hour: number, count: number): string {
  return `${DAY_LABELS[day]} ${hour.toString().padStart(2, '0')}:00 · ${count} ${count === 1 ? 'play' : 'plays'}`;
}

export default async function HeatmapPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { cells } = await fetchHeatmap({ cookieHeader, cache: 'no-store' });

  if (cells.length === 0) {
    return (
      <SectionContent>
        <EmptyState
          icon={CalendarClock}
          title="Not enough plays yet"
          description="Start a few previews from the catalog and the heatmap will fill in by day and hour."
          action={
            <Link
              href="/catalog/tracks"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              Open the catalog
            </Link>
          }
        />
      </SectionContent>
    );
  }

  const { matrix, peak, quiet } = asMatrix(cells);
  const totalPlays = cells.reduce((sum, cell) => sum + cell.listenCount, 0);

  return (
    <>
      <P2PageHero
        eyebrow="/me/stats/heatmap"
        icon={CalendarClock}
        title="Your listening clock."
        description={`Total plays across the grid: ${totalPlays.toLocaleString()}. Peak cell currently has ${peak.count.toLocaleString()} plays.`}
      />
      <SectionContent className="space-y-6">
        <P2StatsTabs items={STATS_TAB_ITEMS} />

        <P2GlassPanel className="p-5 sm:p-6">
          <P2Heatmap counts={matrix} />
        </P2GlassPanel>

        <section className="grid gap-3 sm:grid-cols-3">
          <P2StatTile
            label="Peak hour"
            value={describeCell(peak.day, peak.hour, peak.count)}
            caption="Most plays in the grid"
          />
          <P2StatTile
            label="Quietest hour"
            value={
              quiet.count === Infinity ? '—' : describeCell(quiet.day, quiet.hour, quiet.count)
            }
            caption="Lowest non-zero cell"
          />
          <P2StatTile
            label="Grid plays"
            value={totalPlays.toLocaleString()}
            caption="Across day/hour cells"
          />
        </section>
      </SectionContent>
    </>
  );
}
