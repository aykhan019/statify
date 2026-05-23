import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ApiClientError } from '@/lib/api-client';
import {
  fetchPublicUserPlaylistDetail,
  fetchPublicUserPlaylistTracks,
} from '@/lib/user-playlists/api';

export const dynamic = 'force-dynamic';

interface PageParams {
  id: string;
}

export default async function CommunityPlaylistDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id } = await params;
  const playlistId = Number(id);
  if (!Number.isFinite(playlistId) || playlistId < 1) {
    notFound();
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let playlist;
  let tracks;
  try {
    [playlist, tracks] = await Promise.all([
      fetchPublicUserPlaylistDetail(playlistId, { cookieHeader, cache: 'no-store' }),
      fetchPublicUserPlaylistTracks(playlistId, {}, { cookieHeader, cache: 'no-store' }),
    ]);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={playlist.name}
        description={`By ${playlist.owner.displayName} · ${playlist.trackCount.toLocaleString()} tracks`}
      />
      {playlist.description !== null && playlist.description.length > 0 && (
        <p className="text-muted-foreground text-sm">{playlist.description}</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          {tracks.data.length === 0 ? (
            <p className="text-muted-foreground text-sm">This playlist has no tracks yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {tracks.data.map((entry) => (
                <li
                  key={`${entry.track.id}-${entry.pos}`}
                  className="flex items-center gap-3 border-b py-2 last:border-b-0"
                >
                  <span className="text-muted-foreground w-8 shrink-0 text-right text-xs">
                    {entry.pos + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{entry.track.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {entry.track.artists.map((artist) => artist.name).join(', ')}
                      {entry.track.album.name.length > 0 ? ` · ${entry.track.album.name}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Link
        href="/community/playlists"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Back to community playlists
      </Link>
    </div>
  );
}
