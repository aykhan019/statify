import { ArrowRight, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SectionContent } from '@/components/section';
import { Icon } from '@/components/ui/Icon';
import {
  P2GlassPanel,
  P2Heatmap,
  P2PageHero,
  P2RankBadge,
  P2StatsTabs,
  P2StatTile,
  STATS_TAB_ITEMS,
} from '@/components/p2';
import { Cover } from '@/components/ui/Cover';
import { fetchHeatmap, fetchTopArtists, fetchTopTracks } from '@/lib/analytics/api';
import { formatTrackName } from '@/components/catalog';
import { pickImageUrl } from '@/lib/utils/pickImageUrl';
import { HEATMAP_DAYS, HEATMAP_HOURS } from '@statify/shared';

export const metadata = {
  title: 'Stats | Statify',
};

export const dynamic = 'force-dynamic';

function asHeatmapMatrix(
  cells: ReadonlyArray<{ dayOfWeek: number; hourOfDay: number; listenCount: number }>,
): number[][] {
  // README day order is Mon..Sun. API uses 0=Sun..6=Sat. Remap.
  const matrix: number[][] = Array.from({ length: HEATMAP_DAYS }, () =>
    Array.from({ length: HEATMAP_HOURS }, () => 0),
  );
  for (const cell of cells) {
    const remappedDay = (cell.dayOfWeek + 6) % 7;
    matrix[remappedDay]![cell.hourOfDay] = cell.listenCount;
  }
  return matrix;
}

export default async function StatsOverviewPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const opts = { cookieHeader, cache: 'no-store' as const };

  const [artistsResult, tracksResult, heatmapResult] = await Promise.allSettled([
    fetchTopArtists({ limit: 5 }, opts),
    fetchTopTracks({ limit: 5 }, opts),
    fetchHeatmap(opts),
  ]);

  const topArtists = artistsResult.status === 'fulfilled' ? artistsResult.value.entries : [];
  const topTracks = tracksResult.status === 'fulfilled' ? tracksResult.value.entries : [];
  const heatmapCells = heatmapResult.status === 'fulfilled' ? heatmapResult.value.cells : [];
  const heatmapMatrix = asHeatmapMatrix(heatmapCells);

  const totalMinutes = topArtists.reduce((sum, entry) => sum + entry.totalMinutes, 0);
  const totalPlays = topArtists.reduce((sum, entry) => sum + entry.listenCount, 0);
  const uniqueArtists = new Set(topArtists.map((entry) => entry.artistId)).size;
  const medianMinutes =
    topArtists.length > 0
      ? topArtists.map((entry) => entry.totalMinutes).sort((a, b) => a - b)[
          Math.floor(topArtists.length / 2)
        ]!
      : 0;

  return (
    <>
      <P2PageHero
        eyebrow="/me/stats"
        icon={BarChart3}
        title="The pattern in your week."
        description="Top artists, top tracks, listening heatmap, and trending. All wired to the existing analytics API."
      />
      <SectionContent className="space-y-6">
        <P2StatsTabs items={STATS_TAB_ITEMS} />

        <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <P2StatTile
            label="Total minutes · 30d"
            value={totalMinutes > 0 ? Math.round(totalMinutes).toLocaleString() : '—'}
            caption="Across ranked artists"
          />
          <P2StatTile
            label="Unique artists · 30d"
            value={uniqueArtists.toLocaleString()}
            caption="In the top-5 sample"
          />
          <P2StatTile
            label="Plays counted"
            value={totalPlays.toLocaleString()}
            caption="Driven by listen events"
          />
          <P2StatTile
            label="Median session"
            value={`${medianMinutes.toFixed(1)}m`}
            caption="Per top artist"
          />
        </section>

        <P2GlassPanel className="p-5 sm:p-6">
          <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
            Hours of day
          </p>
          <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-fg-strong">
            When you listen
          </h3>
          <div className="mt-5">
            <P2Heatmap counts={heatmapMatrix} />
          </div>
        </P2GlassPanel>

        <section className="grid gap-4 lg:grid-cols-2">
          <P2GlassPanel className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                  Top 5
                </p>
                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-fg-strong">
                  Artists
                </h3>
              </div>
              <Link
                href="/me/stats/top-artists"
                className="inline-flex items-center gap-1 text-xs font-semibold text-fg-muted hover:text-fg-strong"
              >
                All <Icon as={ArrowRight} size="xs" />
              </Link>
            </div>
            <ol className="mt-4 divide-y divide-border-default/60">
              {topArtists.length === 0 ? (
                <li className="py-6 text-center text-sm text-fg-muted">
                  Plays will rank artists here once history fills in.
                </li>
              ) : (
                topArtists.slice(0, 5).map((entry, index) => (
                  <li
                    key={entry.artistId}
                    className="motion-list-item grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 py-2.5"
                  >
                    <P2RankBadge rank={entry.rank ?? index + 1} />
                    <Cover
                      src={entry.artistImageUrl}
                      name={entry.artistName}
                      entity="artist"
                      size="xs"
                      context="list-dense"
                      inSection={true}
                    />
                    <Link
                      href={`/catalog/artists/${entry.artistId}`}
                      className="truncate text-sm font-semibold text-fg-strong hover:text-section-accent"
                    >
                      {entry.artistName}
                    </Link>
                    <span className="shrink-0 font-mono text-xs text-fg-muted tabular-nums">
                      {entry.listenCount} plays
                    </span>
                  </li>
                ))
              )}
            </ol>
          </P2GlassPanel>

          <P2GlassPanel className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-bold tracking-[0.16em] text-section-accent uppercase">
                  Top 5
                </p>
                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight text-fg-strong">
                  Tracks
                </h3>
              </div>
              <Link
                href="/me/stats/top-tracks"
                className="inline-flex items-center gap-1 text-xs font-semibold text-fg-muted hover:text-fg-strong"
              >
                All <Icon as={ArrowRight} size="xs" />
              </Link>
            </div>
            <ol className="mt-4 divide-y divide-border-default/60">
              {topTracks.length === 0 ? (
                <li className="py-6 text-center text-sm text-fg-muted">
                  Tracks rank by play count from your history.
                </li>
              ) : (
                topTracks.slice(0, 5).map((entry, index) => (
                  <li
                    key={entry.trackId}
                    className="motion-list-item grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 py-2.5"
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
                    <span className="shrink-0 font-mono text-xs text-fg-muted tabular-nums">
                      {entry.listenCount} plays
                    </span>
                  </li>
                ))
              )}
            </ol>
          </P2GlassPanel>
        </section>
      </SectionContent>
    </>
  );
}
