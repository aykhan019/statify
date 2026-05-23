import Link from 'next/link';
import type { MpdPlaylistListItem } from '@statify/shared';
import { Card } from '@/components/ui/Card';

interface PlaylistCardProps {
  playlist: MpdPlaylistListItem;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Card className="hover:bg-muted transition-colors">
      <Link
        href={`/catalog/playlists/${playlist.id}`}
        className="flex flex-wrap items-center justify-between gap-4 p-4"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="hover:text-accent truncate text-base font-medium">{playlist.name}</span>
          <p className="text-muted-foreground truncate text-sm">
            {playlist.trackCount.toLocaleString()} tracks
            {playlist.collaborative ? ' · collaborative' : ''}
          </p>
        </div>
        <div className="text-muted-foreground flex shrink-0 gap-3 text-xs sm:text-sm">
          <span>{playlist.numFollowers.toLocaleString()} followers</span>
          <span>#{playlist.mpdPid}</span>
        </div>
      </Link>
    </Card>
  );
}
