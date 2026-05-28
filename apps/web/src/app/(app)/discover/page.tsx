import { Compass, Play } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SectionContent } from '@/components/section';
import { EmptyState } from '@/components/states';
import { buttonVariants } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { P2GlassPanel, P2HeroButton, P2PageHero, P2Pill } from '@/components/p2';
import { Cover } from '@/components/ui/Cover';
import { fetchDiscover } from '@/lib/analytics/api';
import { formatTrackName } from '@/components/catalog';
import { pickImageUrl } from '@/lib/utils/pickImageUrl';

export const metadata = {
  title: 'Discover | Statify',
};

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 24;

export default async function DiscoverPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const { entries } = await fetchDiscover(
    { limit: DEFAULT_LIMIT },
    { cookieHeader, cache: 'no-store' },
  );

  if (entries.length === 0) {
    return (
      <SectionContent>
        <EmptyState
          icon={Compass}
          title="Nothing to discover yet"
          description="Play a few tracks first so we can find new ones that share playlists with them."
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

  const featured = entries[0]!;
  const rest = entries.slice(1);

  return (
    <>
      <P2PageHero
        eyebrow="/discover"
        icon={Compass}
        title="New tracks adjacent to your taste."
        description="Tracks that share playlists with your listening history, surfaced by catalog co-occurrence signals."
        actions={
          <>
            <P2Pill tone="on-block">From all sources</P2Pill>
            <P2Pill tone="on-block">Limit {DEFAULT_LIMIT}</P2Pill>
          </>
        }
      />
      <SectionContent className="space-y-6">
        <article
          className="relative overflow-hidden rounded-(--radius-lg) border border-section-frame/30 p-5 sm:p-7"
          style={{
            background: 'linear-gradient(135deg, var(--color-teal-500), var(--color-indigo-700))',
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 80% at 100% 0%, color-mix(in oklch, var(--color-cyan-400) 28%, transparent), transparent 70%)',
            }}
          />
          <div className="relative grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
            <div className="shrink-0 rounded-(--radius-md) bg-black/30 p-2 ring-1 ring-white/15 backdrop-blur-sm">
              <Cover
                src={pickImageUrl(
                  featured.trackImageUrl,
                  featured.albumImageUrl,
                  featured.artistImageUrl,
                )}
                name={featured.trackName}
                entity="track"
                size="lg"
                context="hero"
                inSection={true}
              />
            </div>
            <div className="min-w-0 text-white">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] opacity-82">
                Featured candidate
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.025em] sm:text-4xl">
                {formatTrackName(featured.trackName)}
              </h2>
              <p className="mt-2 text-base opacity-90">
                <strong className="font-extrabold">{featured.primaryArtistName}</strong> ·{' '}
                {featured.albumName}
              </p>
              <p className="mt-3 max-w-prose text-sm opacity-82">
                Shared with <strong>{featured.cooccurrenceCount} playlists</strong> alongside tracks
                you&rsquo;ve already played.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-stretch sm:[&>a]:w-44 sm:[&>a]:justify-center">
              <P2HeroButton href={`/catalog/tracks/${featured.trackId}`}>
                Preview
                <Icon as={Play} size="sm" />
              </P2HeroButton>
              <P2HeroButton href="/me/playlists" variant="ghost">
                Add to playlist
              </P2HeroButton>
            </div>
          </div>
        </article>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((entry) => {
            return (
              <P2GlassPanel
                key={entry.trackId}
                className="motion-list-item flex flex-col gap-4 p-4 motion-interactive hover:-translate-y-0.5 hover:border-section-frame"
              >
                <div className="flex items-start gap-3">
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
                  <div className="min-w-0 flex-1">
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
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-section-frame/30 bg-section-tint text-section-accent motion-interactive hover:bg-section-accent hover:text-section-accent-fg"
                  >
                    <Icon as={Play} size="sm" />
                  </Link>
                </div>
                <div className="rounded-(--radius-sm) bg-surface-sunken/80 p-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fg-faint">
                    Because you played
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-fg-strong">
                    {entry.albumName}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <P2Pill tone="section">Shared with {entry.cooccurrenceCount} playlists</P2Pill>
                  <Link
                    href={`/catalog/tracks/${entry.trackId}`}
                    className="text-xs font-semibold text-section-accent hover:underline"
                  >
                    Open →
                  </Link>
                </div>
              </P2GlassPanel>
            );
          })}
        </section>
      </SectionContent>
    </>
  );
}
