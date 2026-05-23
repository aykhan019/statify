import Link from 'next/link';
import { cookies } from 'next/headers';
import { UserPlaylistCard } from '@/components/playlists/UserPlaylistCard';
import { Card, CardContent } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchPublicUserPlaylists } from '@/lib/user-playlists/api';

export const metadata = {
  title: 'Community playlists | Statify',
};

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  q?: string;
}

const DEFAULT_LIMIT = 24;

export default async function CommunityPlaylistsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const page = Math.max(1, Number(params.page) || 1);

  const response = await fetchPublicUserPlaylists(
    { page, limit: DEFAULT_LIMIT, q: params.q },
    { cookieHeader, cache: 'no-store' },
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Community playlists"
        description={`Public playlists from other users. ${response.total.toLocaleString()} total.`}
      />
      {response.data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No community playlists yet. Be the first to make yours public.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {response.data.map((playlist) => (
              <UserPlaylistCard
                key={playlist.id}
                playlist={playlist}
                href={`/community/playlists/${playlist.id}`}
              />
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
                <Link
                  className="text-accent font-medium"
                  href={`/community/playlists?page=${response.page - 1}${
                    params.q ? `&q=${encodeURIComponent(params.q)}` : ''
                  }`}
                >
                  ← Prev
                </Link>
              )}
              {response.page < response.totalPages && (
                <Link
                  className="text-accent font-medium"
                  href={`/community/playlists?page=${response.page + 1}${
                    params.q ? `&q=${encodeURIComponent(params.q)}` : ''
                  }`}
                >
                  Next →
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
