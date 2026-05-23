import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';

const HIGHLIGHTS = [
  {
    title: 'Catalog explorer',
    description: 'Browse tracks, artists, and albums normalized from the Million Playlist Dataset.',
  },
  {
    title: 'Personal stats',
    description: 'Top artists, listening heatmaps, trending acts, and hidden gems.',
  },
  {
    title: 'Playlists',
    description: 'Build your own collections and compare them against curated cohorts.',
  },
];

export default function HomePage() {
  return (
    <Container size="xl" className="flex flex-col gap-16 py-16">
      <section className="flex flex-col items-start gap-6">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Statify
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Music analytics, end to end.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Statify ingests the Spotify Million Playlist Dataset, enriches it with iTunes previews,
          and surfaces listening insights through six purpose-built SQL queries.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-(--radius) px-5 py-3 text-sm font-medium"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="border-border text-foreground hover:bg-muted rounded-(--radius) border px-5 py-3 text-sm font-medium"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HIGHLIGHTS.map((highlight) => (
          <Card key={highlight.title}>
            <CardHeader>
              <CardTitle>{highlight.title}</CardTitle>
              <CardDescription>{highlight.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </Container>
  );
}
