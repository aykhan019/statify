import Link from 'next/link';
import type { TrackListItem } from '@statify/shared';
import { Badge } from '@/components/ui/Badge';
import { Cover } from '@/components/ui/Cover';
import { formatDurationMs, formatTrackArtists, formatTrackName } from './format';

interface TrackRowProps {
  track: TrackListItem;
}

export function TrackRow({ track }: TrackRowProps) {
  const coverImage = track.imageUrl ?? track.album.imageUrl;
  const trackName = formatTrackName(track.name);

  return (
    <div className="group rounded-(--radius-md) border border-border-default bg-surface-raised motion-colors motion-list-item hover:bg-section-row-hover">
      <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
        <Link href={`/catalog/tracks/${track.id}`} className="shrink-0">
          <Cover src={coverImage} name={trackName} entity="track" size="sm" context="list-dense" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/catalog/tracks/${track.id}`}
            className="block truncate text-base font-semibold text-fg-strong hover:text-section-accent"
          >
            {trackName}
          </Link>
          <p className="truncate text-sm text-fg-muted">
            <Link
              href={`/catalog/artists/${track.album.primaryArtist.id}`}
              className="hover:text-fg-strong"
            >
              {formatTrackArtists(track.artists)}
            </Link>
            <span aria-hidden="true"> · </span>
            <Link href={`/catalog/albums/${track.album.id}`} className="hover:text-fg-strong">
              {track.album.name}
            </Link>
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          {track.previewUrl !== null ? (
            <Badge variant="active">Preview</Badge>
          ) : (
            <span className="text-xs text-fg-faint">No preview</span>
          )}
          <span className="font-mono text-sm text-fg-muted tabular-nums">
            {formatDurationMs(track.durationMs)}
          </span>
        </div>
      </div>
    </div>
  );
}
