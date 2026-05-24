import Link from 'next/link';
import type { SimilarPlaylistEntry } from '@statify/shared';

interface SimilarPlaylistsListProps {
  entries: SimilarPlaylistEntry[];
}

export function SimilarPlaylistsList({ entries }: SimilarPlaylistsListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-fg-muted text-sm">
        No similar playlists share enough tracks with this one.
      </p>
    );
  }

  return (
    <ol className="divide-y">
      {entries.map((entry) => (
        <li
          key={entry.playlistId}
          className="flex items-center justify-between gap-4 rounded-(--radius-sm) px-2 py-2 transition-colors hover:bg-section-row-hover"
        >
          <Link
            href={`/catalog/playlists/${entry.playlistId}`}
            className="text-sm font-medium text-fg-strong hover:text-section-accent"
          >
            {entry.name}
          </Link>
          <div className="flex shrink-0 gap-3 text-xs text-fg-muted sm:text-sm">
            <span>{entry.sharedTracks} shared</span>
            <span className="font-medium text-section-accent">
              Jaccard {(entry.jaccard * 100).toFixed(1)}%
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
