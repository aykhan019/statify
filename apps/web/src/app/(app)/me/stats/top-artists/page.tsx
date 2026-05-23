import Link from 'next/link';
import { cookies } from 'next/headers';
import { TopArtistsChart } from '@/components/stats/TopArtistsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
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
      <Container size="lg" className="flex flex-col gap-6 py-2">
        <PageHeader
          title="Top artists"
          description="Your most played artists, ranked by play count."
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Not enough listens yet. Play a few previews from the{' '}
              <Link href="/catalog/tracks" className="text-accent underline">
                catalog
              </Link>{' '}
              and check back.
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0);
  const totalPlays = entries.reduce((sum, entry) => sum + entry.listenCount, 0);

  return (
    <Container size="lg" className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Top artists"
        description={`Ranked across ${totalPlays.toLocaleString()} plays / ${totalMinutes.toFixed(0)} min.`}
      />
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
              <li key={entry.artistId} className="flex items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-8 text-right text-sm font-medium">
                    #{entry.rank}
                  </span>
                  <Link
                    href={`/catalog/artists/${entry.artistId}`}
                    className="text-foreground hover:text-accent text-sm font-medium"
                  >
                    {entry.artistName}
                  </Link>
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
