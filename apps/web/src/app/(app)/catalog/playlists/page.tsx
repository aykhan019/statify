import { ListMusic } from 'lucide-react';
import { cookies } from 'next/headers';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import { EmptyState } from '@/components/states';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchPlaylists } from '@/lib/playlists/api';

export const metadata = {
  title: 'Playlists | Statify',
};

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  q?: string;
}

const DEFAULT_LIMIT = 24;

export default async function PlaylistsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const page = Math.max(1, Number(params.page) || 1);

  const response = await fetchPlaylists(
    { page, limit: DEFAULT_LIMIT, q: params.q, sort: '-numFollowers' },
    { cookieHeader, cache: 'no-store' },
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Playlists"
        description={`MPD playlists, ranked by followers. ${response.total.toLocaleString()} total.`}
      />
      {response.data.length === 0 ? (
        <EmptyState icon={ListMusic} title="No playlists yet" />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {response.data.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
          <nav
            aria-label="Playlist pagination"
            className="flex items-center justify-between gap-4 text-sm"
          >
            <span className="text-muted-foreground">
              Page {response.page} of {response.totalPages}
            </span>
            <div className="flex gap-2">
              {response.page > 1 && (
                <a
                  className="font-medium text-section-accent"
                  href={`/catalog/playlists?page=${response.page - 1}${
                    params.q ? `&q=${encodeURIComponent(params.q)}` : ''
                  }`}
                >
                  ← Prev
                </a>
              )}
              {response.page < response.totalPages && (
                <a
                  className="font-medium text-section-accent"
                  href={`/catalog/playlists?page=${response.page + 1}${
                    params.q ? `&q=${encodeURIComponent(params.q)}` : ''
                  }`}
                >
                  Next →
                </a>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
