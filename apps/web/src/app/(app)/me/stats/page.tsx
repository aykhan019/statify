import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Stats | Statify',
};

const STATS_LINKS = [
  {
    href: '/me/stats/top-artists',
    title: 'Top artists',
    description: 'The artists you played the most, ranked.',
  },
  {
    href: '/me/stats/top-tracks',
    title: 'Top tracks',
    description: 'Your most listened tracks with total minutes.',
  },
  {
    href: '/me/stats/heatmap',
    title: 'Listening heatmap',
    description: 'When you listen, broken out by day and hour.',
  },
  {
    href: '/me/stats/trending',
    title: 'Trending artists',
    description: 'Artists climbing fastest in your recent listens.',
  },
];

export default function StatsOverviewPage() {
  return (
    <Container size="lg" className="flex flex-col gap-8 py-2">
      <PageHeader
        title="Personal stats"
        description="Insights derived from your listening history."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {STATS_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="block">
            <Card className="hover:bg-muted transition-colors">
              <CardHeader>
                <CardTitle>{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-accent text-sm font-medium">Open →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
