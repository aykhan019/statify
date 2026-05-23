import Link from 'next/link';
import type { ArtistListItem } from '@statify/shared';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

interface ArtistCardProps {
  artist: ArtistListItem;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/catalog/artists/${artist.id}`} className="block">
      <Card className="hover:bg-muted h-full transition-colors">
        <CardHeader>
          <CardTitle>{artist.name}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}
