import Link from 'next/link';
import type { ListeningHistoryListItem } from '@statify/shared';
import { Card } from '@/components/ui/Card';
import { formatDurationMs, formatTrackArtists } from '@/components/catalog';

interface HistoryRowProps {
  item: ListeningHistoryListItem;
}

export function HistoryRow({ item }: HistoryRowProps) {
  return (
    <Card className="transition-colors hover:bg-section-row-hover">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            href={`/catalog/tracks/${item.track.id}`}
            className="truncate text-base font-medium hover:text-section-accent"
          >
            {item.track.name}
          </Link>
          <p className="text-muted-foreground truncate text-sm">
            {formatTrackArtists(item.track.artists)} ·{' '}
            <Link href={`/catalog/albums/${item.track.album.id}`} className="hover:text-foreground">
              {item.track.album.name}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground tabular-nums">
            {formatDurationMs(item.durationPlayedMs)} / {formatDurationMs(item.track.durationMs)}
          </span>
          <time
            dateTime={item.playedAt}
            className="text-muted-foreground text-xs"
            title={item.playedAt}
          >
            {formatRelative(item.playedAt)}
          </time>
        </div>
      </div>
    </Card>
  );
}

function formatRelative(iso: string): string {
  const playedAt = new Date(iso).getTime();
  if (Number.isNaN(playedAt)) {
    return iso;
  }

  const diffMs = Date.now() - playedAt;
  if (diffMs < 60_000) return 'just now';
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)}m ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
  if (diffMs < 604_800_000) return `${Math.floor(diffMs / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString();
}
