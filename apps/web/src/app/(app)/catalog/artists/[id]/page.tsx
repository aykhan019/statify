import { notFound } from 'next/navigation';
import { CatalogDetailHero, TracksInfiniteList } from '@/components/catalog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ApiClientError } from '@/lib/api-client';
import { fetchArtistById, fetchTracks } from '@/lib/catalog/api';

interface ArtistDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ArtistDetailPage({ params }: ArtistDetailPageProps) {
  const { id } = await params;
  const artistId = Number.parseInt(id, 10);

  if (!Number.isInteger(artistId) || artistId <= 0) {
    notFound();
  }

  let artist;
  try {
    artist = await fetchArtistById(artistId);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const discography = await fetchTracks({ artistId, page: 1 });

  return (
    <section className="flex flex-col gap-6">
      <CatalogDetailHero
        entity="artist"
        eyebrow="Artist"
        imageUrl={artist.imageUrl}
        title={artist.name}
        meta={`${artist.trackCount.toLocaleString()} tracks across ${artist.albumCount.toLocaleString()} albums`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Discography</CardTitle>
          <CardDescription>Tracks credited to {artist.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <TracksInfiniteList
            initial={discography}
            baseQuery={{ artistId }}
            emptyText="No tracks ingested for this artist yet."
          />
        </CardContent>
      </Card>
    </section>
  );
}
