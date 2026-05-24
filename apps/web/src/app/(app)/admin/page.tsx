import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export const metadata = {
  title: 'Admin | Statify',
};

const ADMIN_LINKS = [
  {
    href: '/admin/users',
    title: 'Users',
    description: 'Search accounts, change roles, ban or unban users.',
  },
  {
    href: '/admin/ingest',
    title: 'Ingestion',
    description: 'Trigger MPD ingestion runs and inspect checkpoints.',
  },
  {
    href: '/admin/audit-log',
    title: 'Audit log',
    description: 'Review privileged actions across the system.',
  },
];

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_LINKS.map((link) => (
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
    </div>
  );
}
