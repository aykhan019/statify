import Link from 'next/link';
import type { UserPlaylistListItem } from '@statify/shared';
import { Badge } from '@/components/ui/Badge';
import { PlaylistArtwork } from './PlaylistArtwork';

interface UserPlaylistCardProps {
  playlist: UserPlaylistListItem;
  href: string;
}

export function UserPlaylistCard({ playlist, href }: UserPlaylistCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <article className="flex h-full gap-4 rounded-(--radius-md) border border-border-default bg-surface-raised p-4 transition-colors hover:bg-section-row-hover">
        <PlaylistArtwork coverImages={playlist.coverImages} name={playlist.name} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="truncate text-lg font-semibold text-fg-strong group-hover:text-section-accent">
            {playlist.name}
          </h2>
          <p className="truncate text-sm text-fg-muted">
            {playlist.trackCount.toLocaleString()} tracks
          </p>
          {playlist.description !== null && playlist.description.length > 0 && (
            <p className="line-clamp-2 text-sm text-fg-muted">{playlist.description}</p>
          )}
          <div className="mt-auto pt-3">
            <Badge variant={playlist.isPublic ? 'success' : 'neutral'}>
              {playlist.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
        </div>
      </article>
    </Link>
  );
}
