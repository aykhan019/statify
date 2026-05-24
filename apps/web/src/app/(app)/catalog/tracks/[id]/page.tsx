import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CatalogDetailHero,
  formatDurationMs,
  formatTrackArtists,
  PreviewPlayerLauncher,
} from '@/components/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Cover } from '@/components/ui/Cover';
import { ApiClientError } from '@/lib/api-client';
import { fetchTrackById } from '@/lib/catalog/api';
import { fetchPlayCount } from '@/lib/history/api';

interface TrackDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
  const { id } = await params;
  const trackId = Number.parseInt(id, 10);

  if (!Number.isInteger(trackId) || trackId <= 0) {
    notFound();
  }

  let track;
  try {
    track = await fetchTrackById(trackId);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const playCount = await fetchPlayCount(trackId, { cookieHeader, cache: 'no-store' }).catch(
    () => ({ trackId, count: 0 }),
  );

  const primaryArtistName = formatTrackArtists(track.artists);

  return (
    <section className="flex flex-col gap-6">
      <CatalogDetailHero
        entity="track"
        eyebrow="Track"
        imageUrl={track.imageUrl ?? track.album.imageUrl}
        title={track.name}
        meta={`${primaryArtistName} · ${formatDurationMs(track.durationMs)}`}
        actions={
          <PreviewPlayerLauncher
            track={{
              trackId: track.id,
              trackName: track.name,
              artistName: primaryArtistName,
              previewUrl: track.previewUrl,
              durationMs: track.durationMs,
            }}
          />
        }
      >
        {playCount.count > 0
          ? `Played ${playCount.count.toLocaleString()} ${
              playCount.count === 1 ? 'time' : 'times'
            }.`
          : 'Not played yet.'}
      </CatalogDetailHero>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Album</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Cover
              src={track.album.imageUrl}
              name={track.album.name}
              entity="album"
              size="md"
              context="card"
            />
            <div className="min-w-0">
              <Link
                href={`/catalog/albums/${track.album.id}`}
                className="text-section-accent hover:underline"
              >
                {track.album.name}
              </Link>
              <p className="mt-1 text-sm text-fg-muted">by {track.album.primaryArtist.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artists</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1.5">
              {track.artists.map((artist) => (
                <li key={artist.id} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Cover
                      src={artist.imageUrl}
                      name={artist.name}
                      entity="artist"
                      size="xs"
                      context="list-dense"
                    />
                    <Link
                      href={`/catalog/artists/${artist.id}`}
                      className="truncate text-section-accent hover:underline"
                    >
                      {artist.name}
                    </Link>
                  </div>
                  <span className="text-xs text-fg-muted capitalize">{artist.role}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
