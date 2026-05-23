import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
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
    <Container size="lg" className="flex flex-col gap-8 py-2">
      <PageHeader
        title={`Hi, ${user?.displayName ?? 'there'}`}
        description="Pick up where you left off."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((link) => (
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
