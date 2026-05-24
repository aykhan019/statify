import { Gem } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { EmptyState } from '@/components/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { fetchHiddenGems } from '@/lib/analytics/api';

export const metadata = {
  title: 'Hidden gems | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 30;
const DEFAULT_MIN_PLAYLISTS = 3;

export default async function HiddenGemsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchHiddenGems(
    { limit: DEFAULT_LIMIT, minPlaylistCount: DEFAULT_MIN_PLAYLISTS },
    { cookieHeader, cache: 'no-store' },
  );

  return (
    <>
      {entries.length === 0 ? (
        <EmptyState
          icon={Gem}
          title="No hidden gems found"
          description="Nothing matches the current threshold. Lower it once the dataset grows."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card
              key={entry.trackId}
              className="motion-colors motion-list-item hover:bg-section-row-hover"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <Link
                    href={`/catalog/tracks/${entry.trackId}`}
                    className="hover:text-section-accent"
                  >
                    {entry.trackName}
                  </Link>
                </CardTitle>
                <p className="truncate text-sm text-fg-muted">
                  {entry.primaryArtistName} · {entry.albumName}
                </p>
              </CardHeader>
              <CardContent className="pt-2">
                <span className="rounded-(--radius-sm) bg-section-tint px-2 py-1 text-xs font-medium text-section-accent">
                  In {entry.playlistCount} playlists
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
