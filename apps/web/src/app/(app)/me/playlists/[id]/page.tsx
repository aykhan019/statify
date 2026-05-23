import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PlaylistTracksManager } from '@/components/playlists/PlaylistTracksManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ApiClientError } from '@/lib/api-client';
import { fetchMyPlaylistDetail, fetchMyPlaylistTracks } from '@/lib/user-playlists/api';

export const dynamic = 'force-dynamic';

interface PageParams {
  id: string;
}

export default async function MyPlaylistDetailPage({ params }: { params: Promise<PageParams> }) {
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
      fetchMyPlaylistDetail(playlistId, { cookieHeader, cache: 'no-store' }),
      fetchMyPlaylistTracks(playlistId, {}, { cookieHeader, cache: 'no-store' }),
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
        description={`${playlist.trackCount.toLocaleString()} tracks · ${playlist.isPublic ? 'Public' : 'Private'}`}
      />
      {playlist.description !== null && playlist.description.length > 0 && (
        <p className="text-muted-foreground text-sm">{playlist.description}</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <PlaylistTracksManager playlistId={playlistId} initialTracks={tracks.data} />
        </CardContent>
      </Card>
      <Link href="/me/playlists" className="text-muted-foreground hover:text-foreground text-sm">
        ← Back to my playlists
      </Link>
    </div>
  );
}
