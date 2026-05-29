import { ArrowRight, Disc3, Library, ListMusic, Mic2, Music2 } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SectionContent } from '@/components/section';
import { Icon } from '@/components/ui/Icon';
import {
  P2GlassPanel,
  P2GradientCover,
  P2PageHero,
  P2Pill,
  type EntityTone,
} from '@/components/p2';
import { fetchTopArtists } from '@/lib/analytics/api';
import { fetchCatalogStats } from '@/lib/catalog/api';
import type { CatalogStatsResponse } from '@statify/shared';

export const metadata = {
  title: 'Catalog | Statify',
};

export const dynamic = 'force-dynamic';

const compactNumber = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatCount(value: number | undefined): string {
  if (value === undefined) return '—';
  return value < 1000 ? value.toLocaleString() : compactNumber.format(value);
}

const CATALOG_TILES = [
  {
    href: '/catalog/tracks',
    icon: Music2,
    label: 'Tracks',
    stat: 'tracks',
    sub: 'Indexed in the catalog',
  },
  {
    href: '/catalog/artists',
    icon: Mic2,
    label: 'Artists',
    stat: 'artists',
    sub: 'Normalized records',
  },
  {
    href: '/catalog/albums',
    icon: Disc3,
    label: 'Albums',
    stat: 'albums',
    sub: 'Linked to tracks',
  },
  {
    href: '/community/playlists',
    icon: ListMusic,
    label: 'Playlists',
    stat: 'playlists',
    sub: 'User and curated sets',
  },
] as const satisfies ReadonlyArray<{
  href: string;
  icon: typeof Music2;
  label: string;
  stat: keyof CatalogStatsResponse;
  sub: string;
}>;

const TONES: readonly EntityTone[] = ['magenta', 'cyan', 'amber', 'violet', 'teal', 'green'];

export default async function CatalogIndexPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const opts = { cookieHeader, cache: 'no-store' as const };

  const [topArtistsResult, statsResult] = await Promise.allSettled([
    fetchTopArtists({ limit: 6 }, opts),
    fetchCatalogStats(opts),
  ]);

  const topArtists = topArtistsResult.status === 'fulfilled' ? topArtistsResult.value.entries : [];
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;

  return (
    <>
      <P2PageHero
        eyebrow="/catalog"
        icon={Library}
        title="The dataset shelf."
        description="Tracks, artists, albums, and playlists - all indexed and ready to browse."
        actions={<P2Pill tone="on-block">SQL-backed</P2Pill>}
      />
      <SectionContent className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CATALOG_TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group flex flex-col gap-2 rounded-(--radius-md) border border-border-default bg-surface-work/88 p-5 motion-interactive hover:-translate-y-0.5 hover:border-section-frame hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
            >
              <span className="grid size-10 place-items-center rounded-(--radius-sm) bg-section-tint text-section-accent">
                <Icon as={tile.icon} size="md" />
              </span>
              <p className="mt-2 font-mono text-[11px] font-bold tracking-[0.14em] text-fg-muted uppercase">
                {tile.label}
              </p>
              <p className="text-2xl font-extrabold leading-none tracking-tight text-fg-strong">
                {formatCount(stats?.[tile.stat])}
              </p>
              <p className="font-mono text-[11px] text-fg-muted">{tile.sub}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-section-accent">
                Browse <Icon as={ArrowRight} size="xs" />
              </span>
            </Link>
          ))}
        </section>

        {topArtists.length > 0 && (
          <P2GlassPanel className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                  Your top artists
                </p>
                <h3 className="mt-1 text-xl font-extrabold tracking-tight text-fg-strong">
                  Most played
                </h3>
              </div>
              <Link
                href="/me/stats/top-artists"
                className="inline-flex h-8 items-center gap-1 rounded-(--radius-sm) px-2 text-xs font-semibold text-fg-muted motion-colors hover:bg-section-row-hover hover:text-fg-strong"
              >
                See all <Icon as={ArrowRight} size="xs" />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {topArtists.slice(0, 6).map((artist, index) => (
                <li key={artist.artistId} className="flex flex-col items-center gap-3 text-center">
                  <Link href={`/catalog/artists/${artist.artistId}`}>
                    <P2GradientCover
                      tone={TONES[index % TONES.length]!}
                      name={artist.artistName}
                      size={96}
                      radius="lg"
                      className="rounded-full"
                    />
                  </Link>
                  <div>
                    <p className="truncate text-sm font-extrabold text-fg-strong">
                      {artist.artistName}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-fg-muted">
                      {artist.listenCount} plays
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </P2GlassPanel>
        )}
      </SectionContent>
    </>
  );
}
