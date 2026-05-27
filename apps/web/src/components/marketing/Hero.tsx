import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { Container } from '@/components/layout';
import { Icon } from '@/components/ui/Icon';
import { HeroBackground } from './HeroBackground';
import { HeroPreview } from './HeroPreview';

/**
 * Marketing hero. Dark backdrop (HeroBackground) under a 2-column
 * layout: copy on the left, floating glass preview cards on the right.
 *
 * Lives under the marketing layout's <Header>, which is opaque. Set
 * a tall top padding so the eye reads "headline first, header second".
 */
export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden text-fg-on-block"
    >
      <HeroBackground />

      <Container
        size="wide"
        gutter="page"
        className="relative z-10 grid w-full items-center gap-20 pb-44 pt-16 lg:grid-cols-[1.05fr_1fr] lg:pt-20"
      >
        <div>
          <h1 className="text-7xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-[5.5rem]">
            The story behind
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, var(--color-violet-200), var(--color-azure-400), var(--color-teal-200))',
              }}
            >
              your listening.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75">
            Statify turns a playlist-scale catalog and your own listening history into top artists,
            trend deltas, heatmaps, and discovery paths — backed by hand-written SQL on the Spotify
            Million Playlist Dataset.
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-(--radius-md) bg-white px-6 text-sm font-semibold text-[oklch(0.18_0.006_265)] motion-interactive hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-paper"
              style={{
                boxShadow:
                  '0 12px 32px -8px color-mix(in oklch, var(--color-violet-500) 70%, transparent)',
              }}
            >
              Start listening
              <Icon as={ArrowRight} size="sm" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex h-12 items-center gap-2.5 rounded-(--radius-md) border border-white/20 bg-white/[0.08] px-6 text-sm font-semibold text-fg-on-block backdrop-blur motion-interactive hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus-paper"
            >
              <span
                className="grid size-5 place-items-center rounded-full text-[10px] text-fg-strong"
                style={{ background: 'var(--color-green-200)' }}
              >
                <Icon as={Play} size="xs" />
              </span>
              Watch the demo
            </Link>
          </div>

          <dl className="mt-10 flex items-center gap-9">
            <HeroStat n="180M" l="Tracks indexed" />
            <Separator />
            <HeroStat n="2.4M" l="Playlists" />
            <Separator />
            <HeroStat n="6" l="SQL queries" />
            <Separator />
            <HeroStat n="4.9★" l="Internal rating" />
          </dl>
        </div>

        <HeroPreview />
      </Container>
    </section>
  );
}

function HeroStat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <dt className="sr-only">{l}</dt>
      <dd className="text-3xl font-bold tracking-tight">{n}</dd>
      <p className="mt-1 text-xs tracking-wider text-white/60">{l}</p>
    </div>
  );
}

function Separator() {
  return <div className="h-8 w-px bg-white/20" />;
}
