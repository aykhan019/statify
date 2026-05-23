import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';

const TABS = [
  { href: '/catalog/tracks', label: 'Tracks' },
  { href: '/catalog/artists', label: 'Artists' },
  { href: '/catalog/albums', label: 'Albums' },
  { href: '/catalog/genres', label: 'Genres' },
] as const;

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return (
    <Container size="lg" className="flex flex-col gap-6 py-2">
      <nav aria-label="Catalog sections" className="border-border flex gap-4 border-b pb-2">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </Container>
  );
}
