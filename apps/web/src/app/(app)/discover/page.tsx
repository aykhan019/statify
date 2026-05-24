import { Compass } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { fetchDiscover } from '@/lib/analytics/api';

export const metadata = {
  title: 'Discover | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 24;

export default async function DiscoverPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchDiscover(
    { limit: DEFAULT_LIMIT },
    { cookieHeader, cache: 'no-store' },
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Compass}
        title="Nothing to discover yet"
        description="Play a few tracks first so we can find new ones that share playlists with them."
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

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <Card key={entry.trackId} className="transition-colors hover:bg-section-row-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              <Link href={`/catalog/tracks/${entry.trackId}`} className="hover:text-section-accent">
                {entry.trackName}
              </Link>
            </CardTitle>
            <p className="truncate text-sm text-fg-muted">
              {entry.primaryArtistName} · {entry.albumName}
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <span className="rounded-(--radius-sm) bg-section-tint px-2 py-1 text-xs font-medium text-section-accent">
              Shared with {entry.cooccurrenceCount} playlists
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
