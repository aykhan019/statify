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
        <li key={entry.playlistId} className="flex items-center justify-between gap-4 py-2">
          <Link
            href={`/catalog/playlists/${entry.playlistId}`}
            className="text-foreground hover:text-accent text-sm font-medium"
          >
            {entry.name}
          </Link>
          <div className="text-muted-foreground flex shrink-0 gap-3 text-xs sm:text-sm">
            <span>{entry.sharedTracks} shared</span>
            <span className="text-accent font-medium">
              Jaccard {(entry.jaccard * 100).toFixed(1)}%
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
