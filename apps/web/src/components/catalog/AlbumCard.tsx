import Link from 'next/link';
import type { AlbumListItem } from '@statify/shared';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface AlbumCardProps {
  album: AlbumListItem;
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/catalog/albums/${album.id}`} className="block">
      <Card className="hover:bg-muted h-full transition-colors">
        <CardHeader>
          <CardTitle>{album.name}</CardTitle>
          <CardDescription>{album.primaryArtist.name}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
