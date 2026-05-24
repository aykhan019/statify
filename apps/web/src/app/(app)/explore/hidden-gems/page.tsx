import { Gem } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { EmptyState } from '@/components/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
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
    <Container size="lg" className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Hidden gems"
        description={`Tracks present in at least ${DEFAULT_MIN_PLAYLISTS} playlists but never previewed by any Statify user.`}
      />
      {entries.length === 0 ? (
        <EmptyState
          icon={Gem}
          title="No hidden gems found"
          description="Nothing matches the current threshold. Lower it once the dataset grows."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.trackId} className="hover:bg-muted transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <Link href={`/catalog/tracks/${entry.trackId}`} className="hover:text-accent">
                    {entry.trackName}
                  </Link>
                </CardTitle>
                <p className="text-muted-foreground truncate text-sm">
                  {entry.primaryArtistName} · {entry.albumName}
                </p>
              </CardHeader>
              <CardContent className="pt-2">
                <span className="bg-accent/15 text-accent rounded-(--radius-sm) px-2 py-1 text-xs font-medium">
                  In {entry.playlistCount} playlists
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
