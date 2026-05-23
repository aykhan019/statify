import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDurationMs, formatTrackArtists, PreviewPlayerLauncher } from '@/components/catalog';
import { ApiClientError } from '@/lib/api-client';
import { fetchTrackById } from '@/lib/catalog/api';

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

  const primaryArtistName = formatTrackArtists(track.artists);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={track.name}
        description={`${primaryArtistName} · ${formatDurationMs(track.durationMs)}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>30-second preview courtesy of iTunes Search.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewPlayerLauncher
            track={{
              trackId: track.id,
              trackName: track.name,
              artistName: primaryArtistName,
              previewUrl: track.previewUrl,
              durationMs: track.durationMs,
            }}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Album</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href={`/catalog/albums/${track.album.id}`}
              className="text-accent hover:underline"
            >
              {track.album.name}
            </Link>
            <p className="text-muted-foreground mt-1 text-sm">
              by {track.album.primaryArtist.name}
            </p>
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
                  <Link
                    href={`/catalog/artists/${artist.id}`}
                    className="text-accent hover:underline"
                  >
                    {artist.name}
                  </Link>
                  <span className="text-muted-foreground text-xs capitalize">{artist.role}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
