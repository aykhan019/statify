import { ListMusic } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { UserPlaylistCard } from '@/components/playlists/UserPlaylistCard';
import { EmptyState } from '@/components/states';
import { Button, buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { fetchMyPlaylists } from '@/lib/user-playlists/api';

export const metadata = {
  title: 'My playlists | Statify',
};

export const dynamic = 'force-dynamic';

interface SearchParams {
  page?: string;
  q?: string;
}

const DEFAULT_LIMIT = 24;

export default async function MyPlaylistsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const page = Math.max(1, Number(params.page) || 1);

  const response = await fetchMyPlaylists(
    { page, limit: DEFAULT_LIMIT, q: params.q },
    { cookieHeader, cache: 'no-store' },
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My playlists"
        description={`${response.total.toLocaleString()} playlists total.`}
        actions={
          <Link href="/me/playlists/new">
            <Button>New playlist</Button>
          </Link>
        }
      />
      {response.data.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="No playlists yet"
          description="You have not created any playlists yet."
          action={
            <Link
              href="/me/playlists/new"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              Create your first playlist
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {response.data.map((playlist) => (
              <UserPlaylistCard
                key={playlist.id}
                playlist={playlist}
                href={`/me/playlists/${playlist.id}`}
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
                  className="font-medium text-section-accent"
                  href={`/me/playlists?page=${response.page - 1}${
                    params.q ? `&q=${encodeURIComponent(params.q)}` : ''
                  }`}
                >
                  ← Prev
                </Link>
              )}
              {response.page < response.totalPages && (
                <Link
                  className="font-medium text-section-accent"
                  href={`/me/playlists?page=${response.page + 1}${
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
