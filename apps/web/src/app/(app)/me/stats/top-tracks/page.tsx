import { Filter, Music2 } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { formatTrackName } from '@/components/catalog';
import { SectionContent } from '@/components/section';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  P2GlassPanel,
  P2MetaPill,
  P2PageHero,
  P2Pill,
  P2RankBadge,
  P2StatsTabs,
  P2StatTile,
  STATS_TAB_ITEMS,
} from '@/components/p2';
import { Cover } from '@/components/ui/Cover';
import { fetchTopTracks } from '@/lib/analytics/api';
import { pickImageUrl } from '@/lib/utils/pickImageUrl';

export const metadata = {
  title: 'Top tracks | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 30;

export default async function TopTracksPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchTopTracks(
    { limit: DEFAULT_LIMIT },
    { cookieHeader, cache: 'no-store' },
  );

  if (entries.length === 0) {
    return (
      <SectionContent>
        <EmptyState
          icon={Music2}
          title="Nothing played yet"
          description="Play a few previews from the catalog and check back to see your most-played tracks."
          action={
            <Link
              href="/catalog/tracks"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              Open the catalog
            </Link>
          }
        />
      </SectionContent>
    );
  }

  const totalPlays = entries.reduce((sum, entry) => sum + entry.listenCount, 0);
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0);
  const leader = entries[0]!;

  return (
    <>
      <P2PageHero
        eyebrow="/me/stats/top-tracks"
        icon={Music2}
        title="The tracks on repeat."
        description={`Ranked across ${totalPlays.toLocaleString()} plays and ${totalMinutes.toFixed(0)} minutes. Every row keeps its catalog link.`}
      />
      <SectionContent className="space-y-6">
        <P2StatsTabs items={STATS_TAB_ITEMS} />

        <section className="grid gap-3 sm:grid-cols-3">
          <P2StatTile
            label="Total plays"
            value={totalPlays.toLocaleString()}
            caption="Across top tracks"
          />
          <P2StatTile
            label="Total minutes"
            value={Math.round(totalMinutes).toLocaleString()}
            caption="Rounded listening minutes"
          />
          <P2StatTile
            label="Current leader"
            value={formatTrackName(leader.trackName)}
            caption={leader.primaryArtistName}
          />
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <P2Pill tone="section">Plays</P2Pill>
            <P2Pill tone="outline">Length</P2Pill>
            <P2Pill tone="outline">First played</P2Pill>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-(--radius-sm) border border-border-strong bg-surface-work px-3 text-xs font-semibold text-fg-default motion-interactive hover:bg-section-row-hover"
          >
            <Icon as={Filter} size="xs" />
            Filter
          </button>
        </div>

        <P2GlassPanel className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                Leaderboard
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-fg-strong">
                Track detail
              </h2>
            </div>
            <P2MetaPill>{entries.length} tracks</P2MetaPill>
          </div>
          <div className="grid grid-cols-[40px_48px_minmax(0,1.4fr)_minmax(0,1fr)_80px_64px] gap-3 border-b border-border-default/60 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fg-faint">
            <span className="text-right">#</span>
            <span />
            <span>Title</span>
            <span className="hidden md:block">Album</span>
            <span className="text-right">Plays</span>
            <span className="text-right">Length</span>
          </div>
          <ol className="divide-y divide-border-default/40">
            {entries.map((entry, index) => {
              return (
                <li
                  key={entry.trackId}
                  className="motion-list-item grid grid-cols-[40px_48px_minmax(0,1.4fr)_minmax(0,1fr)_80px_64px] items-center gap-3 py-2.5 motion-colors hover:bg-section-row-hover"
                >
                  <P2RankBadge rank={entry.rank ?? index + 1} />
                  <Cover
                    src={pickImageUrl(
                      entry.trackImageUrl,
                      entry.albumImageUrl,
                      entry.artistImageUrl,
                    )}
                    name={entry.trackName}
                    entity="track"
                    size="xs"
                    context="list-dense"
                    inSection={true}
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/catalog/tracks/${entry.trackId}`}
                      className="block truncate text-sm font-semibold text-fg-strong hover:text-section-accent"
                    >
                      {formatTrackName(entry.trackName)}
                    </Link>
                    <p className="truncate text-xs text-fg-muted">{entry.primaryArtistName}</p>
                  </div>
                  <span className="hidden truncate text-sm text-fg-muted md:block">
                    {entry.albumName}
                  </span>
                  <span className="text-right font-mono text-xs text-fg-muted tabular-nums">
                    {entry.listenCount}
                  </span>
                  <span className="text-right font-mono text-xs text-fg-muted tabular-nums">
                    {entry.totalMinutes.toFixed(1)}m
                  </span>
                </li>
              );
            })}
          </ol>
        </P2GlassPanel>
      </SectionContent>
    </>
  );
}
