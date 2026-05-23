import Link from 'next/link';
import type { TrackListItem } from '@statify/shared';
import { Card } from '@/components/ui/Card';
import { formatDurationMs, formatTrackArtists } from './format';

interface TrackRowProps {
  track: TrackListItem;
}

export function TrackRow({ track }: TrackRowProps) {
  return (
    <Card className="hover:bg-muted transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            href={`/catalog/tracks/${track.id}`}
            className="hover:text-accent truncate text-base font-medium"
          >
            {track.name}
          </Link>
          <p className="text-muted-foreground truncate text-sm">
            <Link
              href={`/catalog/artists/${track.album.primaryArtist.id}`}
              className="hover:text-foreground"
            >
              {formatTrackArtists(track.artists)}
            </Link>
            <span aria-hidden="true"> · </span>
            <Link href={`/catalog/albums/${track.album.id}`} className="hover:text-foreground">
              {track.album.name}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {track.previewUrl !== null ? (
            <span className="bg-accent/15 text-accent rounded-(--radius-sm) px-2 py-1 text-xs font-medium">
              Preview
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">No preview</span>
          )}
          <span className="text-muted-foreground tabular-nums text-sm">
            {formatDurationMs(track.durationMs)}
          </span>
        </div>
      </div>
    </Card>
  );
}
