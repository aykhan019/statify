import { ArrowRight, Compass, Gem, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { SectionContent } from '@/components/section';
import { Icon } from '@/components/ui/Icon';
import { coverSrc } from '@/components/ui/Cover';
import { P2GradientCover, P2PageHero, P2Pill, P2RouteCard, type EntityTone } from '@/components/p2';
import { PlaylistCard } from '@/components/playlists/PlaylistCard';
import { UserPlaylistCard } from '@/components/playlists/UserPlaylistCard';
import { fetchArtists } from '@/lib/catalog/api';
import { fetchPlaylists } from '@/lib/playlists/api';
import { fetchPublicUserPlaylists } from '@/lib/user-playlists/api';

export const metadata = {
  title: 'Community | Statify',
};

export const dynamic = 'force-dynamic';

const PREVIEW_LIMIT = 6;

const TONES: readonly EntityTone[] = ['violet', 'magenta', 'cyan', 'amber', 'teal', 'green'];

export default async function CommunityPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const opts = { cookieHeader, cache: 'no-store' as const };

  const [publicResult, curatedResult, artistsResult] = await Promise.allSettled([
    fetchPublicUserPlaylists({ page: 1, limit: PREVIEW_LIMIT }, opts),
    fetchPlaylists({ page: 1, limit: PREVIEW_LIMIT, sort: '-numFollowers' }, opts),
    fetchArtists({ limit: PREVIEW_LIMIT, sort: '-plays' }, opts),
  ]);

  const publicPlaylists = publicResult.status === 'fulfilled' ? publicResult.value : null;
  const curated = curatedResult.status === 'fulfilled' ? curatedResult.value : null;
  const popularArtists = artistsResult.status === 'fulfilled' ? artistsResult.value.data : [];

  return (
    <>
      <P2PageHero
        eyebrow="/community"
        icon={Users}
        title="Where Statify listens together."
        description="Public playlists from other listeners, curated sets, and the artists everyone's playing — all in one place."
        actions={<P2Pill tone="on-block">Public + curated</P2Pill>}
      />
      <SectionContent className="space-y-10">
        {publicPlaylists !== null && publicPlaylists.data.length > 0 && (
          <Rail
            eyebrow="From the community"
            title="Featured public playlists"
            meta={`${publicPlaylists.total.toLocaleString()} public`}
            seeAllHref="/community/playlists"
            seeAllLabel="All public playlists"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {publicPlaylists.data.map((playlist) => (
                <UserPlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  href={`/community/playlists/${playlist.id}`}
                />
              ))}
            </div>
          </Rail>
        )}

        {curated !== null && curated.data.length > 0 && (
          <Rail
            eyebrow="Editorial"
            title="Curated picks"
            meta="Ranked by followers"
            seeAllHref="/catalog/playlists"
            seeAllLabel="Browse all playlists"
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {curated.data.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </Rail>
        )}

        {popularArtists.length > 0 && (
          <Rail
            eyebrow="Community-wide"
            title="Popular across Statify"
            meta="Most played"
            seeAllHref="/catalog/artists"
            seeAllLabel="All artists"
          >
            <ul className="grid grid-cols-3 gap-4 sm:grid-cols-6">
              {popularArtists.map((artist, index) => (
                <li key={artist.id} className="flex flex-col items-center gap-3 text-center">
                  <Link href={`/catalog/artists/${artist.id}`} className="group">
                    {artist.imageUrl ? (
                      <span className="relative inline-flex size-24 overflow-hidden rounded-full border border-white/12 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.45)] motion-interactive group-hover:-translate-y-0.5">
                        <Image
                          src={coverSrc(artist.imageUrl, 192)}
                          alt={artist.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </span>
                    ) : (
                      <P2GradientCover
                        tone={TONES[index % TONES.length]!}
                        name={artist.name}
                        size={96}
                        radius="lg"
                        className="rounded-full motion-interactive group-hover:-translate-y-0.5"
                      />
                    )}
                  </Link>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-fg-strong">{artist.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-fg-muted">
                      #{String(index + 1).padStart(2, '0')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Rail>
        )}

        <section className="space-y-4">
          <RailHeader eyebrow="Keep exploring" title="More ways in" />
          <div className="grid gap-3 sm:grid-cols-2">
            <P2RouteCard
              href="/discover"
              icon={Compass}
              title="Discover"
              description="New tracks adjacent to your taste, surfaced by catalog co-occurrence signals."
              meta="Open Discover"
            />
            <P2RouteCard
              href="/explore/hidden-gems"
              icon={Gem}
              title="Hidden gems"
              description="Under-the-radar tracks that show up across playlists but rarely on charts."
              meta="Open Hidden gems"
            />
          </div>
        </section>
      </SectionContent>
    </>
  );
}

interface RailHeaderProps {
  eyebrow: string;
  title: string;
  meta?: ReactNode;
  seeAllHref?: string;
  seeAllLabel?: string;
}

function RailHeader({ eyebrow, title, meta, seeAllHref, seeAllLabel }: RailHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-section-accent">
          {eyebrow}
        </p>
        <h2 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-fg-strong">
          {title}
          {meta !== undefined && <P2Pill tone="subtle">{meta}</P2Pill>}
        </h2>
      </div>
      {seeAllHref !== undefined && (
        <Link
          href={seeAllHref}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-(--radius-sm) px-3 text-sm font-semibold text-section-accent motion-colors hover:bg-section-row-hover"
        >
          {seeAllLabel ?? 'See all'} <Icon as={ArrowRight} size="xs" />
        </Link>
      )}
    </div>
  );
}

function Rail({ children, ...header }: RailHeaderProps & { children: ReactNode }) {
  return (
    <section className="space-y-4">
      <RailHeader {...header} />
      {children}
    </section>
  );
}
