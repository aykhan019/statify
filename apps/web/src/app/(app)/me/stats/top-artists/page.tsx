import { Download, Mic2 } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SectionContent } from '@/components/section';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  P2GlassPanel,
  P2HeroButton,
  P2MetaPill,
  P2PageHero,
  P2Pill,
  P2Podium,
  P2RankBadge,
  P2StatsTabs,
  P2StatTile,
  STATS_TAB_ITEMS,
  type PodiumEntry,
} from '@/components/p2';
import { Cover } from '@/components/ui/Cover';
import { fetchTopArtists } from '@/lib/analytics/api';

export const metadata = {
  title: 'Top artists | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;

export default async function TopArtistsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchTopArtists(
    { limit: DEFAULT_LIMIT },
    { cookieHeader, cache: 'no-store' },
  );

  if (entries.length === 0) {
    return (
      <SectionContent>
        <EmptyState
          icon={Mic2}
          title="Not enough listens yet"
          description="Play a few previews from the catalog and check back to see your most-played artists."
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

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.totalMinutes, 0);
  const totalPlays = entries.reduce((sum, entry) => sum + entry.listenCount, 0);
  const leader = entries[0]!;
  const maxPlays = leader.listenCount;

  const podiumEntries = (
    entries.length >= 3
      ? ([
          {
            name: entries[0]!.artistName,
            caption: `${(entries[0]!.totalMinutes / 60).toFixed(1)} h · ${entries[0]!.listenCount} plays`,
            imageUrl: entries[0]!.artistImageUrl,
          },
          {
            name: entries[1]!.artistName,
            caption: `${(entries[1]!.totalMinutes / 60).toFixed(1)} h · ${entries[1]!.listenCount} plays`,
            imageUrl: entries[1]!.artistImageUrl,
          },
          {
            name: entries[2]!.artistName,
            caption: `${(entries[2]!.totalMinutes / 60).toFixed(1)} h · ${entries[2]!.listenCount} plays`,
            imageUrl: entries[2]!.artistImageUrl,
          },
        ] as const)
      : null
  ) as readonly [PodiumEntry, PodiumEntry, PodiumEntry] | null;

  const tail = entries.slice(3);

  return (
    <>
      <P2PageHero
        eyebrow="/me/stats/top-artists"
        icon={Mic2}
        title="Who's owning the hours."
        description={`Ranked across ${totalPlays.toLocaleString()} plays and ${totalMinutes.toFixed(0)} minutes from your real listening history.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <P2Pill
                key={period}
                tone={period === '30d' ? 'on-block' : 'outline'}
                className="text-white/90"
              >
                {period}
              </P2Pill>
            ))}
          </div>
        }
      />

      <SectionContent className="space-y-6">
        <P2StatsTabs items={STATS_TAB_ITEMS} />

        <section className="grid gap-3 sm:grid-cols-3">
          <P2StatTile
            label="Total plays"
            value={totalPlays.toLocaleString()}
            caption="Across ranked artists"
          />
          <P2StatTile
            label="Total minutes"
            value={Math.round(totalMinutes).toLocaleString()}
            caption="Rounded listening minutes"
          />
          <P2StatTile
            label="Current leader"
            value={leader.artistName}
            caption={`${leader.listenCount} plays`}
          />
        </section>

        {podiumEntries !== null && (
          <P2GlassPanel className="relative overflow-hidden p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                  Podium
                </p>
                <h2 className="mt-1 text-xl font-extrabold tracking-tight text-fg-strong">
                  Top three
                </h2>
              </div>
              <P2HeroButton
                href="#leaderboard"
                variant="ghost"
                className="border-border-strong bg-transparent text-fg-default hover:bg-section-row-hover"
              >
                <Icon as={Download} size="sm" />
                Export CSV
              </P2HeroButton>
            </div>
            <div className="mx-auto max-w-[720px]">
              <P2Podium entries={podiumEntries} size="lg" />
            </div>
          </P2GlassPanel>
        )}

        <P2GlassPanel id="leaderboard" className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                Leaderboard
              </p>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-fg-strong">
                Ranks 4&ndash;{entries.length}
              </h2>
            </div>
            <P2MetaPill>{entries.length} artists</P2MetaPill>
          </div>
          <ol className="divide-y divide-border-default/60">
            {tail.map((entry, index) => {
              const rank = entry.rank ?? index + 4;
              const widthPct = Math.max(6, Math.round((entry.listenCount / maxPlays) * 100));
              return (
                <li
                  key={entry.artistId}
                  className="motion-list-item grid grid-cols-[40px_48px_minmax(0,1.2fr)_minmax(0,1fr)_100px] items-center gap-3 py-3 motion-colors hover:bg-section-row-hover"
                >
                  <P2RankBadge rank={rank} />
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
                  <div className="hidden h-2 w-full overflow-hidden rounded-full bg-surface-sunken/80 md:block">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${widthPct}%`,
                        background:
                          'linear-gradient(90deg, var(--section-accent), color-mix(in oklch, var(--section-accent) 60%, transparent))',
                      }}
                    />
                  </div>
                  <span className="shrink-0 text-right font-mono text-xs text-fg-muted tabular-nums">
                    {entry.listenCount} plays
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
