import { Music2 } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { formatTrackName } from '@/components/catalog';
import { TopTracksChart } from '@/components/stats/TopTracksChart';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
    );
  }

  const totalPlays = entries.reduce((sum, entry) => sum + entry.listenCount, 0);
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0);

  return (
    <>
      <p className="text-sm text-fg-muted">
        Ranked across {totalPlays.toLocaleString()} plays / {totalMinutes.toFixed(0)} min.
      </p>
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
              <li
                key={entry.trackId}
                className="flex items-center justify-between gap-4 rounded-(--radius-sm) px-2 py-2 motion-colors motion-list-item hover:bg-section-row-hover"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-8 shrink-0 text-right text-sm font-medium text-fg-muted">
                    #{entry.rank}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/catalog/tracks/${entry.trackId}`}
                      className="block truncate text-sm font-medium text-fg-strong hover:text-section-accent"
                    >
                      {formatTrackName(entry.trackName)}
                    </Link>
                    <p className="truncate text-xs text-fg-muted">
                      {entry.primaryArtistName} · {entry.albumName}
                    </p>
                  </div>
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
