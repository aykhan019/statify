import Link from 'next/link';
import type { ArtistListItem } from '@statify/shared';
import { Cover } from '@/components/ui/Cover';

interface ArtistCardProps {
  artist: ArtistListItem;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/catalog/artists/${artist.id}`} className="group block h-full motion-list-item">
      <article className="flex h-full flex-col gap-4 rounded-(--radius-md) border border-border-default bg-surface-raised p-4 motion-colors hover:bg-section-row-hover">
        <Cover
          src={artist.imageUrl}
          name={artist.name}
          entity="artist"
          size="lg"
          context="card"
          className="motion-transform group-hover:scale-[1.02]"
        />
        <h2 className="truncate text-lg font-semibold text-fg-strong group-hover:text-section-accent">
          {artist.name}
        </h2>
      </article>
    </Link>
  );
}
