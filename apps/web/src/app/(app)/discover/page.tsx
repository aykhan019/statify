import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
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
      <Container size="lg" className="flex flex-col gap-6 py-2">
        <PageHeader
          title="Discover"
          description="Tracks that travel with your favorites, but you haven't played yet."
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Play a few tracks first so we can find new ones that share playlists with them.
            </p>
            <Link
              href="/catalog/tracks"
              className="text-accent mt-2 inline-block text-sm font-medium"
            >
              Open the catalog →
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Discover"
        description="Tracks that appear in playlists alongside your top track but you haven't heard yet."
      />
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
                Shared with {entry.cooccurrenceCount} playlists
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
