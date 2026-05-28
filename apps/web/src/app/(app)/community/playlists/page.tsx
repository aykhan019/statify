import { Users } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { UserPlaylistCard } from '@/components/playlists/UserPlaylistCard';
import { SectionContent } from '@/components/section';
import { EmptyState } from '@/components/states';
import { P2PageHero, P2Toolbar } from '@/components/p2';
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
    <>
      <P2PageHero
        eyebrow="/community/playlists"
        icon={Users}
        title="Public mixes from the community."
        description={`${response.total.toLocaleString()} public playlist${response.total === 1 ? '' : 's'} from other listeners.`}
      />
      <SectionContent className="space-y-6">
        {response.data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No community playlists yet"
            description="No one has made a playlist public yet. Be the first."
          />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {response.data.map((playlist) => (
                <UserPlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  href={`/community/playlists/${playlist.id}`}
                />
              ))}
            </div>
            <P2Toolbar>
              <span className="text-sm text-fg-muted">
                Page {response.page} of {response.totalPages}
              </span>
              <div className="flex gap-2 text-sm">
                {response.page > 1 && (
                  <Link
                    className="font-semibold text-section-accent"
                    href={`/community/playlists?page=${response.page - 1}${
                      params.q ? `&q=${encodeURIComponent(params.q)}` : ''
                    }`}
                  >
                    ← Prev
                  </Link>
                )}
                {response.page < response.totalPages && (
                  <Link
                    className="font-semibold text-section-accent"
                    href={`/community/playlists?page=${response.page + 1}${
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
