import Link from 'next/link';
import type { ListeningHistoryListItem } from '@statify/shared';
import { formatTrackArtists } from '@/components/catalog';
import { Cover } from '@/components/ui/Cover';
import { P2Pill } from '@/components/p2';
import { pickImageUrl } from '@/lib/utils/pickImageUrl';

interface HistoryRowProps {
  item: ListeningHistoryListItem;
  index?: number;
  playCount?: number;
}

export function HistoryRow({ item, playCount }: HistoryRowProps) {
  return (
    <div className="motion-list-item grid grid-cols-[88px_40px_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border-default/50 px-2 py-3 motion-colors hover:bg-section-row-hover">
      <time
        dateTime={item.playedAt}
        title={item.playedAt}
        className="font-mono text-[11px] text-fg-muted tabular-nums"
      >
        {formatTimeShort(item.playedAt)}
      </time>
      <Cover
        src={pickImageUrl(item.track.imageUrl, item.track.album.imageUrl)}
        name={item.track.name}
        entity="track"
        size="xs"
        context="list-dense"
        inSection={true}
      />
      <div className="min-w-0">
        <Link
          href={`/catalog/tracks/${item.track.id}`}
          className="block truncate text-sm font-semibold text-fg-strong hover:text-section-accent"
        >
          {item.track.name}
        </Link>
        <p className="truncate text-xs text-fg-muted">
          {formatTrackArtists(item.track.artists)} ·{' '}
          <Link href={`/catalog/albums/${item.track.album.id}`} className="hover:text-fg-strong">
            {item.track.album.name}
          </Link>
        </p>
      </div>
      {playCount !== undefined && playCount > 1 ? (
        <P2Pill tone="section" className="font-mono tabular-nums">
          ×{playCount}
        </P2Pill>
      ) : (
        <span aria-hidden />
      )}
      <P2Pill tone="subtle">{item.source}</P2Pill>
    </div>
  );
}

function formatTimeShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
