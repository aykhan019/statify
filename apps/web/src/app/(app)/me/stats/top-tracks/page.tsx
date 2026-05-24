import { Music2 } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { TopTracksChart } from '@/components/stats/TopTracksChart';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchTopTracks } from '@/lib/analytics/api';

export const metadata = {
  title: 'Top tracks | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 15;

export default async function TopTracksPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchTopTracks(
    { limit: DEFAULT_LIMIT },
    { cookieHeader, cache: 'no-store' },
  );

  if (entries.length === 0) {
    return (
      <Container size="lg" className="flex flex-col gap-6 py-2">
        <PageHeader
          title="Top tracks"
          description="Your most played tracks, ranked by play count."
        />
        <EmptyState
          icon={Music2}
          title="Nothing played yet"
          description="Play a few previews from the catalog and check back to see your most-played tracks."
          action={
            <Link
              href="/catalog/tracks"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              Open the catalog
            </Link>
          }
        />
      </Container>
    );
  }

  const totalPlays = entries.reduce((sum, entry) => sum + entry.listenCount, 0);
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0);

  return (
    <Container size="lg" className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Top tracks"
        description={`Ranked across ${totalPlays.toLocaleString()} plays / ${totalMinutes.toFixed(0)} min.`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Plays per track</CardTitle>
        </CardHeader>
        <CardContent>
          <TopTracksChart entries={entries} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="divide-y">
            {entries.map((entry) => (
              <li key={entry.trackId} className="flex items-center justify-between gap-4 py-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="text-muted-foreground w-8 shrink-0 text-right text-sm font-medium">
                    #{entry.rank}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/catalog/tracks/${entry.trackId}`}
                      className="text-foreground hover:text-accent block truncate text-sm font-medium"
                    >
                      {entry.trackName}
                    </Link>
                    <p className="text-muted-foreground truncate text-xs">
                      {entry.primaryArtistName} · {entry.albumName}
                    </p>
                  </div>
                </div>
                <div className="text-muted-foreground flex shrink-0 gap-4 text-xs sm:text-sm">
                  <span>{entry.listenCount} plays</span>
                  <span>{entry.totalMinutes.toFixed(1)} min</span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </Container>
  );
}
