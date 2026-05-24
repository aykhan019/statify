import Link from 'next/link';
import type { MpdPlaylistListItem } from '@statify/shared';
import { Badge } from '@/components/ui/Badge';
import { formatDurationMs } from '@/components/catalog/format';
import { PlaylistArtwork } from './PlaylistArtwork';

interface PlaylistCardProps {
  playlist: MpdPlaylistListItem;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link href={`/catalog/playlists/${playlist.id}`} className="group block h-full">
      <article className="flex h-full gap-4 rounded-(--radius-md) border border-border-default bg-surface-raised p-4 transition-colors hover:bg-section-row-hover">
        <PlaylistArtwork coverImages={playlist.coverImages} name={playlist.name} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="truncate text-lg font-semibold text-fg-strong group-hover:text-section-accent">
            {playlist.name}
          </h2>
          <p className="truncate text-sm text-fg-muted">
            {playlist.trackCount.toLocaleString()} tracks
            {playlist.collaborative ? ' · collaborative' : ''}
          </p>
          <p className="font-mono text-xs text-fg-faint tabular-nums">
            {formatDurationMs(playlist.durationMs)}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            <Badge variant="playlist">{playlist.numFollowers.toLocaleString()} followers</Badge>
            <Badge variant="neutral">MPD #{playlist.mpdPid}</Badge>
          </div>
        </div>
      </article>
    </Link>
  );
}
