import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { TracksInfiniteList } from '@/components/catalog';
import { ApiClientError } from '@/lib/api-client';
import { fetchAlbumById, fetchTracks } from '@/lib/catalog/api';

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = await params;
  const albumId = Number.parseInt(id, 10);

  if (!Number.isInteger(albumId) || albumId <= 0) {
    notFound();
  }

  let album;
  try {
    album = await fetchAlbumById(albumId);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const tracks = await fetchTracks({ albumId, page: 1 });

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={album.name}
        description={
          <>
            by{' '}
            <Link
              href={`/catalog/artists/${album.primaryArtist.id}`}
              className="text-accent hover:underline"
            >
              {album.primaryArtist.name}
            </Link>{' '}
            · {album.trackCount.toLocaleString()} tracks
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Tracks</CardTitle>
          <CardDescription>Listing in catalog order.</CardDescription>
        </CardHeader>
        <CardContent>
          <TracksInfiniteList
            initial={tracks}
            baseQuery={{ albumId }}
            emptyText="No tracks ingested for this album yet."
          />
        </CardContent>
      </Card>
    </section>
  );
}
