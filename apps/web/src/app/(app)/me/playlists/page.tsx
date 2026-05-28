import { ArrowRight, ListMusic, Plus } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { UserPlaylistCard } from '@/components/playlists/UserPlaylistCard';
import { SectionContent } from '@/components/section';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { P2GlassPanel, P2HeroButton, P2PageHero, P2Toolbar } from '@/components/p2';
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

  const latest = response.data[0];

  return (
    <>
      <P2PageHero
        eyebrow="/me/playlists"
        icon={ListMusic}
        title="Your library, arranged."
        description={`${response.total.toLocaleString()} playlist${response.total === 1 ? '' : 's'} in your library.`}
        actions={
          <P2HeroButton href="/me/playlists/new">
            <Icon as={Plus} size="sm" />
            New playlist
          </P2HeroButton>
        }
      />
      <SectionContent className="space-y-6">
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
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {response.data.map((playlist) => (
                <UserPlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  href={`/me/playlists/${playlist.id}`}
                />
              ))}
            </div>

            {latest !== undefined && (
              <P2GlassPanel className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                    Continue building
                  </p>
                  <h3 className="mt-1 text-xl font-extrabold tracking-tight text-fg-strong">
                    Last touched · <span className="italic text-section-accent">{latest.name}</span>
                  </h3>
                  <p className="mt-1 max-w-prose text-sm text-fg-muted">
                    Pick back up where you left off. The track manager keeps the same
                    drag-to-reorder behavior.
                  </p>
                </div>
                <Link
                  href={`/me/playlists/${latest.id}`}
                  className="inline-flex h-10 items-center gap-2 rounded-(--radius-sm) bg-section-accent px-4 text-sm font-semibold text-section-accent-fg motion-interactive hover:opacity-90"
                >
                  Continue
                  <Icon as={ArrowRight} size="sm" />
                </Link>
              </P2GlassPanel>
            )}

            <P2Toolbar>
              <span className="text-sm text-fg-muted">
                Page {response.page} of {response.totalPages}
              </span>
              <div className="flex gap-2 text-sm">
                {response.page > 1 && (
                  <Link
                    className="font-semibold text-section-accent"
                    href={`/me/playlists?page=${response.page - 1}${
                      params.q ? `&q=${encodeURIComponent(params.q)}` : ''
                    }`}
                  >
                    ← Prev
                  </Link>
                )}
                {response.page < response.totalPages && (
                  <Link
                    className="font-semibold text-section-accent"
                    href={`/me/playlists?page=${response.page + 1}${
                      params.q ? `&q=${encodeURIComponent(params.q)}` : ''
                    }`}
                  >
                    Next →
                  </Link>
                )}
              </div>
            </P2Toolbar>
          </>
        )}
      </SectionContent>
    </>
  );
}
