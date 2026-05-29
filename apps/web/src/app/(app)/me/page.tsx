import {
  Activity,
  ArrowRight,
  Clock3,
  Compass,
  Gem,
  Headphones,
  Home,
  ListMusic,
  Search,
  type LucideIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SectionContent } from '@/components/section';
import { Cover, coverSrc } from '@/components/ui/Cover';
import { Icon } from '@/components/ui/Icon';
import {
  P2GlassPanel,
  P2HeroButton,
  P2MiniLine,
  P2PageHero,
  P2Podium,
  type PodiumEntry,
} from '@/components/p2';
import { getServerSession } from '@/lib/auth/session';
import { fetchHeatmap, fetchTopArtists, fetchTopTracks } from '@/lib/analytics/api';
import { fetchHistory } from '@/lib/history/api';
import { formatTrackName } from '@/components/catalog';
import { pickImageUrl } from '@/lib/utils/pickImageUrl';

export const metadata = {
  title: 'Overview | Statify',
};

export const dynamic = 'force-dynamic';

const CAPABILITY_TILES = [
  { href: '/catalog/tracks', icon: Headphones, label: 'Play previews', sub: '30-second previews' },
  { href: '/catalog', icon: Search, label: 'Browse catalog', sub: '180M tracks indexed' },
  {
    href: '/me/playlists',
    icon: ListMusic,
    label: 'Manage playlists',
    sub: 'Build sets from the catalog',
  },
  { href: '/discover', icon: Compass, label: 'Discover', sub: 'Adjacent recommendations' },
];

const QUICK_ROUTES: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  note: string;
}> = [
  { href: '/discover', label: 'Discover tracks', icon: Compass, note: 'Catalog co-occurrence' },
  {
    href: '/explore/hidden-gems',
    label: 'Hidden gems',
    icon: Gem,
    note: 'Quiet but signal-strong',
  },
  {
    href: '/me/history',
    label: 'Recent listens',
    icon: Clock3,
    note: 'Every preview leaves a trace',
  },
  { href: '/me/stats/trending', label: 'Trending artists', icon: Activity, note: '7d vs prior 7d' },
];

function formatRelative(iso: string): string {
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return iso;
  const diff = Date.now() - at;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// eslint-disable-next-line complexity
function topDayOfWeek(
  cells: ReadonlyArray<{ dayOfWeek: number; listenCount: number }>,
): string | null {
  if (cells.length === 0) return null;
  const totals = new Array<number>(7).fill(0);
  for (const cell of cells)
    totals[cell.dayOfWeek] = (totals[cell.dayOfWeek] ?? 0) + cell.listenCount;
  let bestIdx = 0;
  for (let i = 1; i < 7; i++) {
    if ((totals[i] ?? 0) > (totals[bestIdx] ?? 0)) bestIdx = i;
  }
  return (totals[bestIdx] ?? 0) > 0 ? (DAY_LABELS[bestIdx] ?? null) : null;
}

const TILE_GRADIENTS: Record<string, string> = {
  magenta: 'linear-gradient(135deg, var(--color-magenta-500), var(--color-violet-700))',
  teal: 'linear-gradient(135deg, var(--color-teal-500), var(--color-indigo-700))',
  violet: 'linear-gradient(135deg, var(--color-violet-500), var(--color-magenta-700))',
  amber: 'linear-gradient(135deg, var(--color-amber-500), var(--color-coral-700))',
};

// eslint-disable-next-line complexity
export default async function OverviewPage() {
  const user = await getServerSession();
  const userName = user?.displayName ?? 'there';
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const opts = { cookieHeader, cache: 'no-store' as const };

  const [topArtistsResult, topTracksResult, historyResult, heatmapResult] =
    await Promise.allSettled([
      fetchTopArtists({ limit: 3 }, opts),
      fetchTopTracks({ limit: 3 }, opts),
      fetchHistory({ page: 1, limit: 30 }, opts),
      fetchHeatmap(opts),
    ]);

  const topArtists = topArtistsResult.status === 'fulfilled' ? topArtistsResult.value.entries : [];
  const topTracks = topTracksResult.status === 'fulfilled' ? topTracksResult.value.entries : [];
  const recent = historyResult.status === 'fulfilled' ? historyResult.value.data : [];
  const heatmapCells = heatmapResult.status === 'fulfilled' ? heatmapResult.value.cells : [];

  const hourly: number[] = Array.from({ length: 24 }, () => 0);
  for (const cell of heatmapCells) {
    hourly[cell.hourOfDay] = (hourly[cell.hourOfDay] ?? 0) + cell.listenCount;
  }
  const hasSparkline = hourly.some((v) => v > 0);

  const peakHourIndex = hourly.reduce(
    (bestIdx, count, idx) => (count > (hourly[bestIdx] ?? 0) ? idx : bestIdx),
    0,
  );
  const peakHourLabel = hasSparkline ? formatHour(peakHourIndex) : null;
  const peakDayOfWeek = topDayOfWeek(heatmapCells);
  const uniqueArtistCount = new Set(recent.map((entry) => entry.track.artists[0]?.id ?? -1)).size;

  // "Last played" panel: newest-first (don't trust upstream ordering), then
  // dedupe by track keeping the most recent play of each.
  const recentDeduped = (() => {
    const ordered = recent
      .map((entry) => ({ entry, at: new Date(entry.playedAt).getTime() }))
      .sort((a, b) => b.at - a.at)
      .map(({ entry }) => entry);
    const seen = new Set<number>();
    const out: typeof recent = [];
    for (const entry of ordered) {
      if (seen.has(entry.track.id)) continue;
      seen.add(entry.track.id);
      out.push(entry);
    }
    return out;
  })();

  const trackArtwork = (track: {
    imageUrl?: string | null;
    album?: { imageUrl?: string | null } | null;
  }) => pickImageUrl(track.imageUrl, track.album?.imageUrl);

  const artistImages = topArtists.map((a) => a.artistImageUrl);

  const minutesListened = Math.round(
    topArtists.reduce((sum, entry) => sum + entry.totalMinutes, 0),
  );
  const totalPlays = topArtists.reduce((sum, entry) => sum + entry.listenCount, 0);

  const recentImages = recent.map((entry) => trackArtwork(entry.track));
  const topTrackImages = topTracks.map((t) =>
    pickImageUrl(t.trackImageUrl, t.albumImageUrl, t.artistImageUrl),
  );

  const fallbackPool = [...artistImages, ...topTrackImages, ...recentImages].filter(
    (url): url is string => typeof url === 'string' && url.length > 0,
  );

  const used = new Set<string>();
  const tileImage = (primary: string | null | undefined): string | null => {
    if (typeof primary === 'string' && primary.length > 0 && !used.has(primary)) {
      used.add(primary);
      return primary;
    }
    for (const candidate of fallbackPool) {
      if (!used.has(candidate)) {
        used.add(candidate);
        return candidate;
      }
    }
    return null;
  };

  const miniTiles = [
    {
      tone: 'magenta',
      eyebrow: 'Top artist',
      label: topArtists[0]?.artistName ?? '-',
      imageUrl: tileImage(artistImages[0]),
    },
    {
      tone: 'teal',
      eyebrow: 'Last played',
      label: recent[0] ? formatTrackName(recent[0].track.name) : '-',
      imageUrl: tileImage(recent[0] ? trackArtwork(recent[0].track) : null),
    },
    {
      tone: 'violet',
      eyebrow: 'Top track',
      label: topTracks[0] ? formatTrackName(topTracks[0].trackName) : '-',
      imageUrl: tileImage(topTrackImages[0]),
    },
    {
      tone: 'amber',
      eyebrow: 'Most replayed',
      label: topArtists[1]?.artistName ?? topArtists[0]?.artistName ?? '-',
      imageUrl: tileImage(artistImages[1] ?? artistImages[0]),
    },
  ] as const;

  return (
    <>
      <P2PageHero
        eyebrow={`/me · ${todayLabel()}`}
        icon={Home}
        title={
          <>
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-violet-200 via-indigo-200 to-teal-200 bg-clip-text text-transparent">
              {userName}
            </span>
            .
          </>
        }
        description={
          totalPlays > 0
            ? `${totalPlays.toLocaleString()} plays and ${minutesListened.toLocaleString()} minutes captured from your real listening history. Jump back in below.`
            : 'Your listening cockpit: play previews, build history, inspect trends, and jump into playlists.'
        }
        actions={
          <>
            <P2HeroButton href="/catalog/tracks?hasPreview=true">
              Play something
              <Icon as={ArrowRight} size="sm" />
            </P2HeroButton>
            <P2HeroButton href="/me/stats" variant="ghost">
              View stats
            </P2HeroButton>
          </>
        }
      />

      <SectionContent className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <P2GlassPanel className="relative overflow-hidden p-0">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(60% 80% at 0% 0%, color-mix(in oklch, var(--color-violet-500) 18%, transparent), transparent 65%), radial-gradient(60% 70% at 100% 100%, color-mix(in oklch, var(--color-teal-500) 14%, transparent), transparent 65%)',
              }}
            />
            <div className="relative grid h-full gap-0 lg:grid-cols-[1fr_1.05fr]">
              <div className="p-5 sm:p-6">
                <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                  Minutes listened · 30d
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold leading-none tracking-[-0.03em] text-fg-strong tabular-nums">
                    {minutesListened > 0 ? minutesListened.toLocaleString() : '-'}
                  </span>
                  <span className="text-sm text-fg-muted">min</span>
                </div>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">
                  {minutesListened > 0 ? (
                    <>
                      {peakHourLabel !== null && (
                        <>
                          Peaks around <strong className="text-fg-strong">{peakHourLabel}</strong>
                          {peakDayOfWeek !== null && (
                            <>
                              {' '}
                              on <strong className="text-fg-strong">{peakDayOfWeek}s</strong>
                            </>
                          )}
                          .{' '}
                        </>
                      )}
                      {uniqueArtistCount > 0 && (
                        <>
                          {uniqueArtistCount} artist{uniqueArtistCount === 1 ? '' : 's'} in your
                          last {recent.length} plays.
                        </>
                      )}
                      {peakHourLabel === null &&
                        uniqueArtistCount === 0 &&
                        'See the heatmap for the day/hour breakdown.'}
                    </>
                  ) : (
                    'Start a few previews from the catalog and this number begins to fill in.'
                  )}
                </p>
                {hasSparkline && (
                  <div className="mt-4">
                    <P2MiniLine
                      data={hourly}
                      height={88}
                      ariaLabel="Plays by hour of day"
                      showDots={false}
                    />
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
                      Plays by hour · 0 → 23
                    </p>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <OverviewSecondary href="/me/history" label="History" />
                  <OverviewSecondary href="/me/stats/top-artists" label="Top artists" />
                  <OverviewSecondary href="/me/stats/heatmap" label="Heatmap" />
                </div>
              </div>

              {/* 2×2 stat mini-tiles with optional background art */}
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-2 p-3 sm:p-3">
                {miniTiles.map(({ tone, eyebrow, label, imageUrl }) => (
                  <div
                    key={eyebrow}
                    className="relative min-h-28 overflow-hidden rounded-(--radius-md) border border-section-frame/40"
                    style={{ background: TILE_GRADIENTS[tone] }}
                  >
                    {imageUrl !== null && (
                      <Image
                        src={coverSrc(imageUrl, 256)}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover opacity-35"
                        aria-hidden
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.18), transparent 60%)',
                      }}
                    />
                    <div className="absolute bottom-3 left-3 text-white/95">
                      <div className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] opacity-80">
                        {eyebrow}
                      </div>
                      <div className="mt-1 line-clamp-2 max-w-[14ch] text-[13px] font-extrabold leading-tight">
                        {label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </P2GlassPanel>

          <P2GlassPanel className="flex flex-col gap-3 p-5 sm:p-6">
            <div>
              <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                Quick routes
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-fg-strong">
                The next useful screen
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {QUICK_ROUTES.map((route) => (
                <InlineRoute key={route.href} {...route} />
              ))}
            </div>
          </P2GlassPanel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          {/* Top of the week - artist ranking with real images */}
          <P2GlassPanel className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                  Top of the week
                </p>
                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-fg-strong">
                  Three artists shaping your hours
                </h3>
              </div>
              <OverviewGhost href="/me/stats/top-artists" label="See all" />
            </div>
            <div className="mt-5">
              {topArtists.length < 3 ? (
                <div className="rounded-(--radius-md) border border-dashed border-border-default p-6 text-center text-sm text-fg-muted">
                  Play a few previews and your top three artists will rank here.
                </div>
              ) : (
                <P2Podium
                  size="sm"
                  entries={
                    [0, 1, 2].map((i) => ({
                      name: topArtists[i]!.artistName,
                      caption: `${(topArtists[i]!.totalMinutes / 60).toFixed(1)} h · ${topArtists[i]!.listenCount} plays`,
                      imageUrl: artistImages[i] ?? null,
                      href: `/catalog/artists/${topArtists[i]!.artistId}`,
                    })) as [PodiumEntry, PodiumEntry, PodiumEntry]
                  }
                />
              )}
            </div>
          </P2GlassPanel>

          {/* Recently played */}
          <P2GlassPanel className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                  Recently played
                </p>
                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-fg-strong">
                  Last played
                </h3>
              </div>
              <OverviewGhost href="/me/history" label="History" />
            </div>
            <div className="mt-4 flex flex-col gap-1">
              {recentDeduped.length === 0 ? (
                <div className="rounded-(--radius-md) border border-dashed border-border-default p-5 text-center text-sm text-fg-muted">
                  Start a preview and it shows up here.
                </div>
              ) : (
                recentDeduped.slice(0, 6).map((item, index) => (
                  <Link
                    key={item.id}
                    href={`/catalog/tracks/${item.track.id}`}
                    className="motion-list-item flex items-center gap-3 rounded-(--radius-sm) px-1 py-2 motion-colors hover:bg-section-row-hover"
                    style={{ '--motion-stagger-index': index } as React.CSSProperties}
                  >
                    <Cover
                      src={trackArtwork(item.track)}
                      name={item.track.name}
                      entity="track"
                      size="xs"
                      context="list-dense"
                      inSection={true}
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-fg-strong">
                        {formatTrackName(item.track.name)}
                      </p>
                      <p className="truncate text-xs text-fg-muted">
                        {item.track.artists[0]?.name ?? 'Unknown'} · {item.source}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-fg-faint tabular-nums">
                      {formatRelative(item.playedAt)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </P2GlassPanel>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CAPABILITY_TILES.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group flex min-h-32 flex-col gap-2.5 rounded-(--radius-md) border border-border-default bg-surface-work/88 p-4 motion-interactive hover:-translate-y-0.5 hover:border-section-frame hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
            >
              <span className="grid size-10 place-items-center rounded-(--radius-sm) bg-section-tint text-section-accent">
                <Icon as={tile.icon} size="md" />
              </span>
              <div>
                <p className="text-base font-extrabold tracking-tight text-fg-strong">
                  {tile.label}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-fg-muted">{tile.sub}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-section-accent">
                Open <Icon as={ArrowRight} size="xs" />
              </span>
            </Link>
          ))}
        </section>
      </SectionContent>
    </>
  );
}

function OverviewSecondary({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-(--radius-sm) border border-border-strong bg-surface-work px-3 text-sm font-semibold text-fg-default motion-interactive hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
    >
      {label}
    </Link>
  );
}

function OverviewGhost({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center gap-1 rounded-(--radius-sm) px-2 text-xs font-semibold text-fg-muted motion-colors hover:bg-section-row-hover hover:text-fg-strong"
    >
      {label}
      <Icon as={ArrowRight} size="xs" />
    </Link>
  );
}

function InlineRoute({
  href,
  icon,
  label,
  note,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-(--radius-sm) border border-border-default bg-surface-raised/80 px-4 py-3 motion-interactive hover:border-section-frame hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid size-8 place-items-center rounded-(--radius-sm) bg-section-tint text-section-accent">
          <Icon as={icon} size="sm" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-fg-strong">{label}</span>
          <span className="block truncate font-mono text-[11px] text-fg-muted">{note}</span>
        </span>
      </span>
      <Icon
        as={ArrowRight}
        size="xs"
        className="text-fg-muted motion-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
