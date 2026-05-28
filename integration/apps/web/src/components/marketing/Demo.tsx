import { Container } from '@/components/layout';
import { ArrowRight } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

const STEPS = [
  {
    n: '01',
    title: 'Search the catalog',
    description: 'Tracks, artists, albums, playlists — all from one query box.',
    Preview: CatalogPreview,
  },
  {
    n: '02',
    title: 'Play an iTunes preview',
    description: '30 seconds, recorded as an idempotent listening event.',
    Preview: PlayerPreview,
  },
  {
    n: '03',
    title: 'Review history & stats',
    description: 'Top artists, hour-of-day heatmaps, and hidden gems.',
    Preview: StatsPreview,
  },
] as const;

export function Demo() {
  return (
    <section id="demo" className="scroll-mt-20 bg-surface-sunken py-32">
      <Container size="wide" gutter="page">
        <div className="max-w-(--container-prose)">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-section-accent">
            Demo path
          </p>
          <h2 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] text-fg-strong text-balance">
            A short route through
            <br />
            the working app.
          </h2>
        </div>

        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map(({ n, title, description, Preview }, i) => (
            <div key={n} className="relative">
              <div className="flex h-full flex-col overflow-hidden rounded-(--radius-lg) border border-border-default bg-surface-work">
                <div
                  className="relative h-52 overflow-hidden"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--surface-page), var(--surface-sunken))',
                  }}
                >
                  <Preview />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-section-accent">{n}</span>
                    <span className="h-px flex-1 bg-border-default" />
                  </div>
                  <h3 className="mt-3.5 text-xl font-bold tracking-tight text-fg-strong">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-fg-muted">{description}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="absolute right-[-14px] top-[100px] z-10 hidden text-section-accent md:block">
                  <Icon as={ArrowRight} size="md" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── per-step preview vignettes ──────────────────────────────────────

function CatalogPreview() {
  const results = [
    'Phoebe Bridgers · artist',
    'Motion Sickness · track',
    'Stranger in the Alps · album',
  ];
  return (
    <div className="flex flex-col gap-2 p-5">
      <div className="flex items-center gap-2 rounded-(--radius-md) border border-border-default bg-surface-work px-3.5 py-2.5 text-xs">
        <span className="text-fg-faint">🔍</span>
        <span className="text-fg-strong">phoebe</span>
        <span
          className="ml-px h-3 w-px bg-section-accent"
          style={{ animation: 'statify-caret 1s steps(2) infinite' }}
        />
      </div>
      {results.map((label) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-(--radius-sm) border border-border-default bg-surface-work px-3 py-2 text-[11px] text-fg-strong"
        >
          <div
            className="size-[18px] rounded-sm"
            style={{
              background:
                'linear-gradient(135deg, var(--color-magenta-500), var(--color-violet-700))',
            }}
          />
          {label}
        </div>
      ))}
      <style>{`@keyframes statify-caret { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

function PlayerPreview() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-5">
      <div
        className="grid size-20 place-items-center rounded-(--radius-md)"
        style={{
          background: 'linear-gradient(135deg, var(--color-magenta-500), var(--color-violet-700))',
          boxShadow:
            '0 10px 30px -10px color-mix(in oklch, var(--color-violet-500) 60%, transparent)',
        }}
      >
        <div className="flex h-8 items-end gap-1">
          {[12, 22, 16, 26].map((h, i) => (
            <div
              key={i}
              className="motion-reduce:!animate-none motion-reduce:!scale-100"
              style={{
                width: 4,
                background: '#fff',
                borderRadius: 2,
                height: h,
                transformOrigin: 'bottom',
                animation: `statify-bar-pulse 1.2s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="h-1 w-4/5 rounded-sm bg-surface-sunken">
        <div
          className="h-full w-[38%] rounded-sm"
          style={{
            background: 'linear-gradient(90deg, var(--color-violet-500), var(--color-indigo-500))',
          }}
        />
      </div>
      <div className="font-mono text-[11px] text-fg-muted">0:11 / 0:30</div>
    </div>
  );
}

function StatsPreview() {
  const bars = [40, 28, 50, 36, 62, 44, 70, 52, 80, 60, 48, 56];
  return (
    <div className="p-5">
      <div className="flex h-20 items-end gap-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: h,
              background:
                'linear-gradient(180deg, var(--color-violet-500), var(--color-indigo-500))',
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[9px] tracking-wider text-fg-muted">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-3.5 text-[11px] font-semibold text-fg-strong">
        23.4h this week · <span style={{ color: 'var(--color-green-500)' }}>+12%</span>
      </div>
    </div>
  );
}
