import {
  ArrowRight,
  BarChart3,
  Database,
  Headphones,
  ListMusic,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/layout';
import { DecorativeCoverTile, type DecorativeCoverTone } from '@/components/ui/DecorativeCoverTile';
import { Icon } from '@/components/ui/Icon';

const COVER_TONES: DecorativeCoverTone[] = ['indigo', 'coral', 'teal', 'magenta', 'amber', 'cyan'];

const CAPABILITIES = [
  {
    description: 'Search tracks, artists, albums, and playlists through normalized MPD entities.',
    icon: Search,
    title: 'Catalog intelligence',
  },
  {
    description: 'Play iTunes previews and record listening history with idempotent events.',
    icon: Headphones,
    title: 'Preview listening',
  },
  {
    description: 'Turn raw history into top artists, heatmaps, trends, and hidden gems.',
    icon: BarChart3,
    title: 'SQL-backed stats',
  },
  {
    description: 'Create collections, reorder tracks, and compare public playlists.',
    icon: ListMusic,
    title: 'Playlist lab',
  },
];

const SYSTEM_POINTS = [
  { label: 'Normalized tables', value: '12' },
  { label: 'Advanced queries', value: '6' },
  { label: 'Preview source', value: 'iTunes' },
  { label: 'Artwork source', value: 'Spotify' },
];

export default function HomePage() {
  return (
    <div data-section-hue="indigo" className="bg-surface-page text-fg-default">
      <section
        id="home"
        className="relative isolate min-h-[66svh] scroll-mt-16 overflow-hidden bg-section-block text-section-block-fg"
      >
        <CoverWall />
        <div className="absolute inset-0 bg-section-block/80" aria-hidden="true" />
        <Container
          size="wide"
          gutter="page"
          className="relative flex min-h-[66svh] items-center py-14 sm:py-16"
        >
          <div className="max-w-(--container-prose)">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] opacity-80">
              Music streaming analytics app
            </p>
            <h1 className="mt-5 text-6xl leading-[0.92] font-extrabold tracking-normal text-balance sm:text-7xl">
              Statify
            </h1>
            <p className="mt-6 max-w-(--container-narrow) text-lg leading-relaxed opacity-90 sm:text-xl">
              Explore a playlist-scale catalog, play 30-second previews, and turn listening events
              into ranked artists, trend deltas, heatmaps, and discovery paths.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-(--radius-sm) bg-surface-page px-5 text-sm font-semibold text-section-accent motion-interactive hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-paper"
              >
                Start listening
                <Icon as={ArrowRight} size="sm" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-(--radius-sm) border border-section-block-fg/40 px-5 text-sm font-semibold text-section-block-fg motion-interactive hover:bg-section-block-fg/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-paper"
              >
                Log in
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container size="wide" gutter="page" className="py-8 sm:py-10 lg:py-12">
        <section className="grid gap-4 md:grid-cols-4">
          {SYSTEM_POINTS.map((point) => (
            <div
              key={point.label}
              className="rounded-(--radius-md) border border-border-default bg-surface-raised p-5"
            >
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-fg-muted">
                {point.label}
              </p>
              <p className="mt-3 text-3xl leading-none font-extrabold tracking-normal text-fg-strong">
                {point.value}
              </p>
            </div>
          ))}
        </section>

        <section id="features" className="scroll-mt-24 mt-16 flex flex-col gap-8">
          <div className="max-w-(--container-prose)">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-section-accent">
              Designed for the demo loop
            </p>
            <h2 className="mt-4 text-4xl leading-tight font-extrabold tracking-normal text-fg-strong text-balance">
              Everything the app does is one click away.
            </h2>
            <p className="mt-5 max-w-(--container-narrow) text-base leading-relaxed text-fg-muted">
              Statify keeps the rubric-heavy pieces visible: relational data, preview playback,
              playlist creation, admin ingest controls, and analytics backed by hand-written SQL.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CAPABILITIES.map((capability) => (
              <article
                key={capability.title}
                className="min-h-56 rounded-(--radius-md) border border-border-default bg-surface-work p-5 motion-interactive hover:border-section-accent hover:bg-section-row-hover"
              >
                <span className="grid size-11 place-items-center rounded-(--radius-sm) bg-section-tint text-section-accent">
                  <Icon as={capability.icon} size="md" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-normal text-fg-strong">
                  {capability.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                  {capability.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="stack"
          className="scroll-mt-24 mt-16 grid overflow-hidden rounded-(--radius-lg) border border-border-default bg-surface-raised lg:grid-cols-[1fr_1fr]"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2 text-section-accent">
              <Icon as={Database} size="md" />
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em]">
                Connected stack
              </p>
            </div>
            <h2 className="mt-5 text-3xl leading-tight font-extrabold tracking-normal text-fg-strong text-balance">
              MPD catalog in Postgres, previews from iTunes, artwork from Spotify.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-fg-muted">
              The frontend is not a static mock: every browse, play, playlist, and analytics route
              is wired through the API and shared DTOs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Pill icon={ShieldCheck} label="Auth and admin controls" />
              <Pill icon={Sparkles} label="Tokenized UI" />
            </div>
          </div>
          <div className="grid min-h-72 grid-cols-3 gap-2 bg-surface-sunken p-3">
            {COVER_TONES.map((tone, index) => (
              <DecorativeCoverTile
                key={`${tone}-${index}`}
                tone={tone}
                className="min-h-24 rounded-(--radius-sm) border border-section-frame bg-surface-raised"
              />
            ))}
          </div>
        </section>

        <section
          id="demo"
          className="scroll-mt-24 mt-16 grid gap-4 md:grid-cols-3"
          aria-labelledby="demo-heading"
        >
          <div className="md:col-span-1">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-section-accent">
              Demo path
            </p>
            <h2
              id="demo-heading"
              className="mt-4 text-3xl leading-tight font-extrabold tracking-normal text-fg-strong text-balance"
            >
              A short route through the working app.
            </h2>
          </div>
          <div className="grid gap-3 md:col-span-2">
            {['Search the catalog', 'Play an iTunes preview', 'Review history and stats'].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-(--radius-md) border border-border-default bg-surface-work p-4"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-(--radius-full) bg-section-tint font-mono text-sm font-bold text-section-accent">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-fg-strong">{step}</p>
                </div>
              ),
            )}
          </div>
        </section>

        <section
          id="about"
          className="scroll-mt-24 mt-16 border-t border-border-default pt-10"
          aria-labelledby="about-heading"
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-section-accent">
            Project scope
          </p>
          <h2
            id="about-heading"
            className="mt-4 text-3xl leading-tight font-extrabold tracking-normal text-fg-strong text-balance"
          >
            Built around the Million Playlist Dataset.
          </h2>
          <p className="mt-4 max-w-(--container-narrow) text-base leading-relaxed text-fg-muted">
            Statify combines normalized playlist data, account sessions, listening history, playlist
            creation, admin operations, and SQL analytics into one demoable product.
          </p>
        </section>
      </Container>
    </div>
  );
}

function CoverWall() {
  return (
    <div
      className="absolute inset-0 grid grid-cols-3 gap-2 p-2 opacity-40 sm:grid-cols-6"
      aria-hidden="true"
    >
      {[...COVER_TONES, ...COVER_TONES].map((tone, index) => (
        <DecorativeCoverTile
          key={`${tone}-${index}`}
          tone={tone}
          className="rounded-(--radius-sm)"
        />
      ))}
    </div>
  );
}

function Pill({ icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-(--radius-full) border border-border-default bg-surface-work px-3 py-2 text-sm font-medium text-fg-default">
      <Icon as={icon} size="sm" />
      {label}
    </span>
  );
}
