import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { TrendingArtistsChart } from '@/components/stats/TrendingArtistsChart';
import { EmptyState } from '@/components/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { fetchTrending } from '@/lib/analytics/api';

export const metadata = {
  title: 'Trending artists | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 12;
const DEFAULT_GROWTH = 0.25;

function formatGrowth(entry: { priorPlays: number; growth: number }): string {
  if (entry.priorPlays === 0) {
    return 'New';
  }
  const pct = Math.round(entry.growth * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

export default async function TrendingPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchTrending(
    { limit: DEFAULT_LIMIT, growthThreshold: DEFAULT_GROWTH },
    { cookieHeader, cache: 'no-store' },
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Nothing trending yet"
        description="Once you have a couple of weeks of plays, artists growing in your listens show up here."
      />
    );
  }

  return (
    <>
      <p className="text-sm text-fg-muted">
        Last 7 days vs prior 7 days. Threshold: +{Math.round(DEFAULT_GROWTH * 100)}%.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Recent plays</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendingArtistsChart entries={entries} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="divide-y">
            {entries.map((entry) => (
              <li
                key={entry.artistId}
                className="flex items-center justify-between gap-4 rounded-(--radius-sm) px-2 py-2 transition-colors hover:bg-section-row-hover"
              >
                <Link
                  href={`/catalog/artists/${entry.artistId}`}
                  className="text-sm font-medium text-fg-strong hover:text-section-accent"
                >
                  {entry.artistName}
                </Link>
                <div className="flex shrink-0 items-center gap-4 text-xs text-fg-muted sm:text-sm">
                  <span>
                    {entry.recentPlays} / {entry.priorPlays} prior
                  </span>
                  <span className="font-medium text-section-accent">{formatGrowth(entry)}</span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </>
  );
}
