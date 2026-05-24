import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { TrackRow } from '@/components/catalog';
import { formatDurationMs } from '@/components/catalog/format';
import { PlaylistHero } from '@/components/playlists/PlaylistHero';
import { SimilarPlaylistsList } from '@/components/playlists/SimilarPlaylistsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { fetchSimilarPlaylists } from '@/lib/analytics/api';
import { ApiClientError } from '@/lib/api-client';
import { fetchPlaylistDetail, fetchPlaylistTracks } from '@/lib/playlists/api';

export const dynamic = 'force-dynamic';

const TRACK_PAGE_SIZE = 30;
const SIMILAR_LIMIT = 10;

interface PageParams {
  id: string;
}

interface SearchParams {
  page?: string;
}

export default async function PlaylistDetailPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const playlistId = Number(id);
  if (!Number.isFinite(playlistId) || playlistId < 1) {
    notFound();
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const trackPage = Math.max(1, Number(search.page) || 1);

  let playlist;
  let tracks;
  let similar;
  try {
    [playlist, tracks, similar] = await Promise.all([
      fetchPlaylistDetail(playlistId, { cookieHeader, cache: 'no-store' }),
      fetchPlaylistTracks(
        playlistId,
        { page: trackPage, limit: TRACK_PAGE_SIZE },
        { cookieHeader, cache: 'no-store' },
      ),
      fetchSimilarPlaylists(
        playlistId,
        { limit: SIMILAR_LIMIT },
        { cookieHeader, cache: 'no-store' },
      ),
    ]);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <PlaylistHero
        coverImages={playlist.coverImages}
        name={playlist.name}
        eyebrow="MPD playlist"
        meta={`${playlist.trackCount.toLocaleString()} tracks · ${playlist.numFollowers.toLocaleString()} followers · ${formatDurationMs(playlist.durationMs)} · MPD #${playlist.mpdPid}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Similar playlists</CardTitle>
        </CardHeader>
        <CardContent>
          <SimilarPlaylistsList entries={similar.entries} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {tracks.data.map((entry) => (
              <li key={`${entry.track.id}-${entry.pos}`} className="flex items-center gap-3">
                <span className="text-muted-foreground w-8 shrink-0 text-right text-xs">
                  {entry.pos + 1}
                </span>
                <div className="flex-1">
                  <TrackRow track={entry.track} />
                </div>
              </li>
            ))}
          </ul>
          <nav
            aria-label="Track pagination"
            className="text-muted-foreground mt-4 flex items-center justify-between text-sm"
          >
            <span>
              Page {tracks.page} of {tracks.totalPages}
            </span>
            <div className="flex gap-2">
              {tracks.page > 1 && (
                <Link
                  className="text-accent font-medium"
                  href={`/catalog/playlists/${playlistId}?page=${tracks.page - 1}`}
                >
                  ← Prev
                </Link>
              )}
              {tracks.page < tracks.totalPages && (
                <Link
                  className="text-accent font-medium"
                  href={`/catalog/playlists/${playlistId}?page=${tracks.page + 1}`}
                >
                  Next →
                </Link>
              )}
            </div>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
