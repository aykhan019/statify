import { BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { SectionBlockHeader, SectionContent } from '@/components/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

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
    <>
      <SectionBlockHeader
        eyebrow="/me/stats"
        icon={BarChart3}
        title="Personal stats"
        description="Insights derived from your listening history."
      />
      <SectionContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {STATS_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="block motion-list-item">
              <Card className="motion-colors hover:bg-section-row-hover">
                <CardHeader>
                  <CardTitle>{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-section-accent">Open →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SectionContent>
    </>
  );
}
