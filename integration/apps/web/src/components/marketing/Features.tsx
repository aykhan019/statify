import { Container } from '@/components/layout';

const CAPABILITIES = [
  {
    title: 'Catalog intelligence',
    description:
      'Search across tracks, artists, albums, and playlists through normalized MPD entities — relational joins, not bag-of-words.',
    Illustration: CatalogIllustration,
  },
  {
    title: 'Preview listening',
    description:
      'Play iTunes 30-second previews inline and record every event with idempotent writes so the history is always trustworthy.',
    Illustration: PreviewIllustration,
  },
  {
    title: 'SQL-backed stats',
    description:
      'Turn raw listening into top artists, trend deltas, hour-of-day heatmaps, hidden gems, and discovery paths — all hand-written queries.',
    Illustration: StatsIllustration,
  },
  {
    title: 'Playlist lab',
    description:
      'Create collections, reorder tracks, and compare public playlists side-by-side. Every action round-trips through the API.',
    Illustration: PlaylistIllustration,
  },
] as const;

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-surface-sunken py-32">
      <Container size="wide" gutter="page">
        <div className="max-w-(--container-prose)">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-section-accent">
            Designed for the demo loop
          </p>
          <h2 className="mt-4 text-5xl font-extrabold leading-[1.05] tracking-[-0.035em] text-fg-strong text-balance">
            Everything the app does is
            <br />
            one click away.
          </h2>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {CAPABILITIES.map(({ title, description, Illustration }) => (
            <article
              key={title}
              className="group grid items-center gap-7 rounded-(--radius-xl) border border-border-default bg-surface-work p-8 motion-interactive hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(10,16,36,0.18)] md:grid-cols-[160px_1fr]"
            >
              <div
                className="grid size-40 place-items-center rounded-(--radius-lg) border border-border-default"
                style={{
                  background: 'linear-gradient(135deg, var(--surface-sunken), var(--surface-work))',
                }}
              >
                <Illustration />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-fg-strong">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ─── illustrations: same SVG vocabulary as the S-Wave logo ──────────

function CatalogIllustration() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden>
      <rect
        x="10"
        y="20"
        width="80"
        height="14"
        rx="4"
        fill="var(--color-violet-500)"
        opacity="0.18"
      />
      <rect x="10" y="20" width="48" height="14" rx="4" fill="var(--color-violet-500)" />
      <rect
        x="10"
        y="42"
        width="80"
        height="14"
        rx="4"
        fill="var(--color-indigo-500)"
        opacity="0.18"
      />
      <rect x="10" y="42" width="68" height="14" rx="4" fill="var(--color-indigo-500)" />
      <rect
        x="10"
        y="64"
        width="80"
        height="14"
        rx="4"
        fill="var(--color-teal-500)"
        opacity="0.18"
      />
      <rect x="10" y="64" width="36" height="14" rx="4" fill="var(--color-teal-500)" />
      <circle cx="86" cy="27" r="4" fill="var(--color-green-500)" />
    </svg>
  );
}

function PreviewIllustration() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden>
      <circle
        cx="50"
        cy="50"
        r="34"
        fill="none"
        stroke="var(--color-violet-500)"
        strokeWidth="3"
        opacity="0.25"
      />
      <circle cx="50" cy="50" r="24" fill="var(--fg-strong)" />
      <polygon points="44,40 44,60 60,50" fill="var(--color-green-200)" />
      {[2, 6, 4, 8, 5, 9, 3].map((h, i) => (
        <rect
          key={`l-${i}`}
          x={6 + i * 3}
          y={50 - h}
          width="2"
          height={h * 2}
          rx="1"
          fill="var(--color-indigo-500)"
          opacity="0.6"
        />
      ))}
      {[3, 7, 4, 9, 5, 8, 4].map((h, i) => (
        <rect
          key={`r-${i}`}
          x={68 + i * 3}
          y={50 - h}
          width="2"
          height={h * 2}
          rx="1"
          fill="var(--color-indigo-500)"
          opacity="0.6"
        />
      ))}
    </svg>
  );
}

function StatsIllustration() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden>
      <rect x="14" y="60" width="10" height="24" rx="2" fill="var(--color-indigo-500)" />
      <rect x="30" y="46" width="10" height="38" rx="2" fill="var(--color-indigo-700)" />
      <rect x="46" y="32" width="10" height="52" rx="2" fill="var(--color-violet-500)" />
      <rect x="62" y="50" width="10" height="34" rx="2" fill="var(--color-teal-500)" />
      <rect x="78" y="40" width="10" height="44" rx="2" fill="var(--color-green-500)" />
      <path
        d="M14 24 L34 30 L54 18 L74 26 L88 14"
        stroke="var(--color-magenta-500)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[14, 34, 54, 74, 88].map((x, i) => (
        <circle
          key={i}
          cx={x}
          cy={[24, 30, 18, 26, 14][i]}
          r="2.5"
          fill="var(--color-magenta-500)"
        />
      ))}
    </svg>
  );
}

function PlaylistIllustration() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" aria-hidden>
      <rect x="10" y="22" width="34" height="34" rx="6" fill="var(--color-violet-500)" />
      <rect x="46" y="14" width="20" height="20" rx="4" fill="var(--color-teal-500)" />
      <rect x="68" y="36" width="20" height="20" rx="4" fill="var(--color-magenta-500)" />
      <rect x="46" y="36" width="20" height="20" rx="4" fill="var(--color-indigo-700)" />
      <rect
        x="10"
        y="60"
        width="80"
        height="6"
        rx="3"
        fill="var(--color-indigo-500)"
        opacity="0.25"
      />
      <rect x="10" y="60" width="50" height="6" rx="3" fill="var(--color-indigo-500)" />
      <rect
        x="10"
        y="72"
        width="80"
        height="6"
        rx="3"
        fill="var(--color-green-500)"
        opacity="0.25"
      />
      <rect x="10" y="72" width="34" height="6" rx="3" fill="var(--color-green-500)" />
    </svg>
  );
}
