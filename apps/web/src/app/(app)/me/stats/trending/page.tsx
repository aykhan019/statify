import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { TrendingArtistsChart } from '@/components/stats/TrendingArtistsChart';
import { EmptyState } from '@/components/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
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
      <Container size="lg" className="flex flex-col gap-6 py-2">
        <PageHeader
          title="Trending artists"
          description="Artists growing in your listens versus the previous week."
        />
        <EmptyState
          icon={TrendingUp}
          title="Nothing trending yet"
          description="Once you have a couple of weeks of plays, artists growing in your listens show up here."
        />
      </Container>
    );
  }

  return (
    <Container size="lg" className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Trending artists"
        description={`Last 7 days vs prior 7 days. Threshold: +${Math.round(DEFAULT_GROWTH * 100)}%.`}
      />
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
              <li key={entry.artistId} className="flex items-center justify-between gap-4 py-2">
                <Link
                  href={`/catalog/artists/${entry.artistId}`}
                  className="text-foreground hover:text-accent text-sm font-medium"
                >
                  {entry.artistName}
                </Link>
                <div className="text-muted-foreground flex shrink-0 items-center gap-4 text-xs sm:text-sm">
                  <span>
                    {entry.recentPlays} / {entry.priorPlays} prior
                  </span>
                  <span className="text-accent font-medium">{formatGrowth(entry)}</span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </Container>
  );
}
