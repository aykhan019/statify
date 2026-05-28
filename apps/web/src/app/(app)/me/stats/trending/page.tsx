import { TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SectionContent } from '@/components/section';
import { EmptyState } from '@/components/states';
import {
  P2GlassPanel,
  P2MetaPill,
  P2PageHero,
  P2StatsTabs,
  P2StatTile,
  STATS_TAB_ITEMS,
} from '@/components/p2';
import { Cover } from '@/components/ui/Cover';
import { fetchTrending } from '@/lib/analytics/api';

export const metadata = {
  title: 'Trending artists | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 24;
const DEFAULT_GROWTH = 0.25;

function formatGrowth(entry: { priorPlays: number; growth: number }): string {
  if (entry.priorPlays === 0) {
    return 'New';
  }
  const pct = Math.round(entry.growth * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

export default async function TrendingPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchTrending(
    { limit: DEFAULT_LIMIT, growthThreshold: 0 },
    { cookieHeader, cache: 'no-store' },
  );

  if (entries.length === 0) {
    return (
      <SectionContent>
        <EmptyState
          icon={TrendingUp}
          title="Nothing trending yet"
          description="Once you have a couple of weeks of plays, artists growing in your listens show up here."
        />
      </SectionContent>
    );
  }

  const climbing = entries.filter((entry) => entry.growth > 0);
  const slipping = entries.filter((entry) => entry.growth <= 0);
  const recentPlays = entries.reduce((sum, entry) => sum + entry.recentPlays, 0);
  const priorPlays = entries.reduce((sum, entry) => sum + entry.priorPlays, 0);

  return (
    <>
      <P2PageHero
        eyebrow="/me/stats/trending"
        icon={TrendingUp}
        title="Artists picking up speed."
        description={`Last 7 days vs prior 7 days. Default threshold: +${Math.round(DEFAULT_GROWTH * 100)}%.`}
      />
      <SectionContent className="space-y-6">
        <P2StatsTabs items={STATS_TAB_ITEMS} />

        <section className="grid gap-3 sm:grid-cols-3">
          <P2StatTile
            label="Recent plays"
            value={recentPlays.toLocaleString()}
            caption="Across trending artists"
          />
          <P2StatTile
            label="Prior plays"
            value={priorPlays.toLocaleString()}
            caption="Comparison window"
          />
          <P2StatTile
            label="Threshold"
            value={`+${Math.round(DEFAULT_GROWTH * 100)}%`}
            caption="Minimum growth"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <P2GlassPanel className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-green-500">
                <TrendingUp size={14} aria-hidden /> Climbing
              </p>
              <P2MetaPill>{climbing.length} artists</P2MetaPill>
            </div>
            <ol className="divide-y divide-border-default/60">
              {climbing.length === 0 ? (
                <li className="py-6 text-center text-sm text-fg-muted">
                  No artists climbing in this window.
                </li>
              ) : (
                climbing.slice(0, 8).map((entry) => (
                  <li
                    key={entry.artistId}
                    className="motion-list-item grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 py-2.5 motion-colors hover:bg-section-row-hover"
                  >
                    <Cover
                      src={entry.artistImageUrl}
                      name={entry.artistName}
                      entity="artist"
                      size="sm"
                      context="list-dense"
                      inSection={true}
                    />
                    <Link
                      href={`/catalog/artists/${entry.artistId}`}
                      className="min-w-0 truncate text-sm font-semibold text-fg-strong hover:text-section-accent"
                    >
                      {entry.artistName}
                    </Link>
                    <span className="shrink-0 font-mono text-xs font-bold text-green-500 tabular-nums">
                      {formatGrowth(entry)}
                    </span>
                  </li>
                ))
              )}
            </ol>
          </P2GlassPanel>

          <P2GlassPanel className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p
                className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-vermilion-500"
                style={{ color: 'var(--color-vermilion-500)' }}
              >
                <TrendingDown size={14} aria-hidden /> Slipping
              </p>
              <P2MetaPill>{slipping.length} artists</P2MetaPill>
            </div>
            <ol className="divide-y divide-border-default/60">
              {slipping.length === 0 ? (
                <li className="py-6 text-center text-sm text-fg-muted">
                  Nothing slipping in this window.
                </li>
              ) : (
                slipping.slice(0, 8).map((entry) => (
                  <li
                    key={entry.artistId}
                    className="motion-list-item grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 py-2.5 motion-colors hover:bg-section-row-hover"
                  >
                    <Cover
                      src={entry.artistImageUrl}
                      name={entry.artistName}
                      entity="artist"
                      size="sm"
                      context="list-dense"
                      inSection={true}
                    />
                    <Link
                      href={`/catalog/artists/${entry.artistId}`}
                      className="min-w-0 truncate text-sm font-semibold text-fg-strong hover:text-section-accent"
                    >
                      {entry.artistName}
                    </Link>
                    <span
                      className="shrink-0 font-mono text-xs font-bold tabular-nums"
                      style={{ color: 'var(--color-vermilion-500)' }}
                    >
                      {formatGrowth(entry)}
                    </span>
                  </li>
                ))
              )}
            </ol>
          </P2GlassPanel>
        </section>

        <P2GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                Cohort velocity
              </p>
              <h3 className="mt-1 text-xl font-extrabold tracking-tight text-fg-strong">
                Recent vs prior
              </h3>
            </div>
            <P2MetaPill>{entries.length} artists</P2MetaPill>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {entries.slice(0, 8).map((entry) => (
              <Link
                key={entry.artistId}
                href={`/catalog/artists/${entry.artistId}`}
                className="motion-list-item flex flex-col gap-2 rounded-(--radius-md) border border-border-default bg-surface-work/88 p-3 motion-interactive hover:border-section-frame hover:bg-section-row-hover"
              >
                <Cover
                  src={entry.artistImageUrl}
                  name={entry.artistName}
                  entity="artist"
                  size="sm"
                  context="card"
                  inSection={true}
                />
                <p className="truncate text-sm font-semibold text-fg-strong">{entry.artistName}</p>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-fg-muted">
                    {entry.recentPlays}/{entry.priorPlays}
                  </span>
                  <span
                    className="font-mono text-[11px] font-bold tabular-nums"
                    style={{
                      color:
                        entry.growth >= 0 ? 'var(--color-green-500)' : 'var(--color-vermilion-500)',
                    }}
                  >
                    {formatGrowth(entry)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </P2GlassPanel>
      </SectionContent>
    </>
  );
}
