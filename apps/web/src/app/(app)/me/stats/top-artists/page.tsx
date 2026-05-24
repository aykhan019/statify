import { Mic2 } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { TopArtistsChart } from '@/components/stats/TopArtistsChart';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { fetchTopArtists } from '@/lib/analytics/api';

export const metadata = {
  title: 'Top artists | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;

export default async function TopArtistsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchTopArtists(
    { limit: DEFAULT_LIMIT },
    { cookieHeader, cache: 'no-store' },
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Mic2}
        title="Not enough listens yet"
        description="Play a few previews from the catalog and check back to see your most-played artists."
        action={
          <Link
            href="/catalog/tracks"
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Open the catalog
          </Link>
        }
      />
    );
  }

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0);
  const totalPlays = entries.reduce((sum, entry) => sum + entry.listenCount, 0);

  return (
    <>
      <p className="text-sm text-fg-muted">
        Ranked across {totalPlays.toLocaleString()} plays / {totalMinutes.toFixed(0)} min.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Plays per artist</CardTitle>
        </CardHeader>
        <CardContent>
          <TopArtistsChart entries={entries} />
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
                className="flex items-center justify-between gap-4 rounded-(--radius-sm) px-2 py-2 motion-colors motion-list-item hover:bg-section-row-hover"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-right text-sm font-medium text-fg-muted">
                    #{entry.rank}
                  </span>
                  <Link
                    href={`/catalog/artists/${entry.artistId}`}
                    className="text-sm font-medium text-fg-strong hover:text-section-accent"
                  >
                    {entry.artistName}
                  </Link>
                </div>
                <div className="flex shrink-0 gap-4 text-xs text-fg-muted sm:text-sm">
                  <span>{entry.listenCount} plays</span>
                  <span>{entry.totalMinutes.toFixed(1)} min</span>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </>
  );
}
