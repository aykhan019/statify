import Link from 'next/link';
import type { AlbumListItem } from '@statify/shared';
import { Cover } from '@/components/ui/Cover';

interface AlbumCardProps {
  album: AlbumListItem;
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/catalog/albums/${album.id}`} className="group block h-full">
      <article className="flex h-full flex-col gap-4 rounded-(--radius-md) border border-border-default bg-surface-raised p-4 transition-colors hover:bg-section-row-hover">
        <Cover
          src={album.imageUrl}
          name={album.name}
          entity="album"
          size="lg"
          context="card"
          className="transition-transform group-hover:scale-[1.02]"
        />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-fg-strong group-hover:text-section-accent">
            {album.name}
          </h2>
          <p className="mt-1 truncate text-sm text-fg-muted">{album.primaryArtist.name}</p>
        </div>
      </article>
    </Link>
  );
}
