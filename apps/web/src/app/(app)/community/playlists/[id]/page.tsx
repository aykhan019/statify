import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { TrackRow } from '@/components/catalog';
import { PlaylistHero } from '@/components/playlists/PlaylistHero';
import { SectionContent } from '@/components/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
    <SectionContent className="flex flex-col gap-6">
      <PlaylistHero
        coverImages={playlist.coverImages}
        name={playlist.name}
        eyebrow="Community playlist"
        meta={`By ${playlist.owner.displayName} · ${playlist.trackCount.toLocaleString()} tracks`}
        description={
          playlist.description !== null && playlist.description.length > 0
            ? playlist.description
            : undefined
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          {tracks.data.length === 0 ? (
            <p className="text-fg-muted text-sm">This playlist has no tracks yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {tracks.data.map((entry) => (
                <li key={`${entry.track.id}-${entry.pos}`} className="flex items-center gap-3">
                  <span className="w-8 shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
                    {entry.pos + 1}
                  </span>
                  <div className="flex-1">
                    <TrackRow track={entry.track} />
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
    </SectionContent>
  );
}
