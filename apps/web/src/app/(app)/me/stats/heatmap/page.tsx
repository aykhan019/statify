import Link from 'next/link';
import { cookies } from 'next/headers';
import { HeatmapGrid } from '@/components/stats/HeatmapGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchHeatmap } from '@/lib/analytics/api';

export const metadata = {
  title: 'Listening heatmap | Statify',
};

export const dynamic = 'force-dynamic';

export default async function HeatmapPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { cells } = await fetchHeatmap({ cookieHeader, cache: 'no-store' });

  if (cells.length === 0) {
    return (
      <Container size="lg" className="flex flex-col gap-6 py-2">
        <PageHeader
          title="Listening heatmap"
          description="When you listen, broken out by day and hour."
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              Not enough plays yet. Start a few previews and the heatmap will fill in.
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

  const totalPlays = cells.reduce((sum, cell) => sum + cell.listenCount, 0);

  return (
    <Container size="lg" className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Listening heatmap"
        description={`Day of week × hour of day. Total plays: ${totalPlays.toLocaleString()}.`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Plays by day and hour</CardTitle>
        </CardHeader>
        <CardContent>
          <HeatmapGrid cells={cells} />
        </CardContent>
      </Card>
    </Container>
  );
}
