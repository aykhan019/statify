import { Gem, Play } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SectionContent } from '@/components/section';
import { EmptyState } from '@/components/states';
import { Icon } from '@/components/ui/Icon';
import { P2GlassPanel, P2PageHero, P2Pill } from '@/components/p2';
import { Cover } from '@/components/ui/Cover';
import { fetchHiddenGems } from '@/lib/analytics/api';
import { formatTrackName } from '@/components/catalog';
import { pickImageUrl } from '@/lib/utils/pickImageUrl';

export const metadata = {
  title: 'Hidden gems | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 30;
const DEFAULT_MIN_PLAYLISTS = 3;

export default async function HiddenGemsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchHiddenGems(
    { limit: DEFAULT_LIMIT, minPlaylistCount: DEFAULT_MIN_PLAYLISTS },
    { cookieHeader, cache: 'no-store' },
  );

  return (
    <>
      <P2PageHero
        eyebrow="/explore/hidden-gems"
        icon={Gem}
        title="Quiet tracks with strong signals."
        description={`Tracks appearing in at least ${DEFAULT_MIN_PLAYLISTS} playlists - popular with curators, quiet on plays.`}
      />
      <SectionContent className="space-y-6">
        {entries.length === 0 ? (
          <EmptyState
            icon={Gem}
            title="No hidden gems found"
            description="Nothing matches the current threshold. Lower it once the dataset grows."
          />
        ) : (
          <section className="grid gap-3 sm:grid-cols-2">
            {entries.map((entry) => {
              return (
                <P2GlassPanel
                  key={entry.trackId}
                  className="motion-list-item overflow-hidden p-0 motion-interactive hover:-translate-y-0.5 hover:border-section-frame"
                >
                  <div className="grid grid-cols-[88px_minmax(0,1fr)]">
                    <div className="relative grid place-items-center bg-surface-sunken/60 p-2">
                      <Cover
                        src={pickImageUrl(
                          entry.trackImageUrl,
                          entry.albumImageUrl,
                          entry.artistImageUrl,
                        )}
                        name={entry.trackName}
                        entity="track"
                        size="sm"
                        context="card"
                        inSection={true}
                      />
                      <span className="absolute left-1.5 top-1.5 rounded-(--radius-xs) bg-black/55 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
                        GEM
                      </span>
                    </div>
                    <div className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/catalog/tracks/${entry.trackId}`}
                            className="block truncate text-base font-extrabold text-fg-strong hover:text-section-accent"
                          >
                            {formatTrackName(entry.trackName)}
                          </Link>
                          <p className="mt-0.5 truncate text-sm text-fg-muted">
                            {entry.primaryArtistName}
                          </p>
                        </div>
                        <Link
                          href={`/catalog/tracks/${entry.trackId}`}
                          aria-label="Preview"
                          className="grid size-8 shrink-0 place-items-center rounded-full bg-section-accent text-section-accent-fg motion-interactive hover:opacity-90"
                        >
                          <Icon as={Play} size="xs" />
                        </Link>
                      </div>
                      <p className="font-mono text-[11px] text-fg-muted">{entry.albumName}</p>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <P2Pill tone="section">In {entry.playlistCount} playlists</P2Pill>
                        <P2Pill tone="outline">Skip</P2Pill>
                      </div>
                    </div>
                  </div>
                </P2GlassPanel>
              );
            })}
          </section>
        )}
      </SectionContent>
    </>
  );
}
