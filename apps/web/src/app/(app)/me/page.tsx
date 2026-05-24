import { Home } from 'lucide-react';
import Link from 'next/link';
import { SectionBlockHeader, SectionContent } from '@/components/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { getServerSession } from '@/lib/auth/session';

export const metadata = {
  title: 'Overview | Statify',
};

const QUICK_LINKS = [
  { href: '/me/history', title: 'Listening history', description: 'Your most recent plays.' },
  {
    href: '/me/stats',
    title: 'Personal stats',
    description: 'Top artists, heatmaps, and trends.',
  },
  { href: '/catalog', title: 'Catalog', description: 'Browse tracks, artists, and albums.' },
];

export default async function OverviewPage() {
  const user = await getServerSession();

  return (
    <>
      <SectionBlockHeader
        eyebrow="/me"
        icon={Home}
        title={`Hi, ${user?.displayName ?? 'there'}`}
        description="Pick up where you left off."
      />
      <SectionContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
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
