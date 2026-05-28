import { Container } from '@/components/layout';

const TECH = [
  'NestJS 10',
  'PostgreSQL 16',
  'Prisma 5',
  'Next.js 15',
  'React 19',
  'Tailwind 4',
  'Zod',
  'Argon2id',
  'JWT',
];

/**
 * Stack section. Left: pitch + tech pills. Right: a syntax-highlighted
 * SQL terminal with an overlapping result card to make "hand-written SQL"
 * tangible.
 */
export function Stack() {
  return (
    <section id="stack" className="scroll-mt-20 bg-surface-page py-32">
      <Container size="wide" gutter="page">
        <div className="grid items-center overflow-hidden rounded-(--radius-xl) border border-border-default bg-surface-work lg:grid-cols-2">
          <div className="p-12">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-section-accent">
              Connected stack
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-[-0.03em] text-fg-strong text-balance">
              MPD catalog in Postgres,
              <br />
              previews from iTunes,
              <br />
              artwork from Spotify.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-fg-muted">
              The frontend is not a static mock: every browse, play, playlist, and analytics route
              is wired through a NestJS API and a shared DTO package.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {TECH.map((t) => (
                <span
                  key={t}
                  className="rounded-(--radius-full) bg-section-tint px-3.5 py-1.5 text-xs font-semibold text-section-accent"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div
            className="relative min-h-[480px] overflow-hidden p-6"
            style={{
              background:
                'linear-gradient(135deg, oklch(0.16 0.04 270) 0%, oklch(0.22 0.1 300) 100%)',
            }}
          >
            <SqlTerminal />
            <QueryResultCard />
          </div>
        </div>
      </Container>
    </section>
  );
}

function SqlTerminal() {
  return (
    <div className="absolute inset-x-5 top-5 overflow-hidden rounded-xl border border-white/12 bg-black/45">
      <div className="flex items-center gap-1.5 border-b border-white/8 px-3.5 py-2.5">
        {['#FF5F57', '#FEBC2E', '#28C840'].map((color) => (
          <div key={color} className="size-2.5 rounded-full" style={{ background: color }} />
        ))}
        <div className="flex-1 text-center text-[11px] text-white/45">
          statify/apps/api · top-artists.query.sql
        </div>
      </div>
      <pre className="m-0 overflow-hidden p-5 font-mono text-xs leading-[1.6] text-white">
        <span className="text-[oklch(0.78_0.16_295)]">SELECT</span>
        {'\n'}
        {'  '}a.name,{'\n'}
        {'  '}
        <span className="text-[oklch(0.86_0.14_140)]">COUNT</span>(p.id) AS plays,{'\n'}
        {'  '}
        <span className="text-[oklch(0.86_0.14_140)]">SUM</span>(t.duration_ms) AS total_ms{'\n'}
        <span className="text-[oklch(0.78_0.16_295)]">FROM</span> listening_events e{'\n'}
        <span className="text-[oklch(0.78_0.16_295)]">JOIN</span> tracks t{' '}
        <span className="text-[oklch(0.78_0.16_295)]">ON</span> t.id = e.track_id{'\n'}
        <span className="text-[oklch(0.78_0.16_295)]">JOIN</span> artists a{' '}
        <span className="text-[oklch(0.78_0.16_295)]">ON</span> a.id = t.artist_id{'\n'}
        <span className="text-[oklch(0.78_0.16_295)]">WHERE</span> e.user_id = $1{'\n'}
        {'  '}
        <span className="text-[oklch(0.78_0.16_295)]">AND</span> e.played_at &gt;{' '}
        <span className="text-[oklch(0.72_0.15_230)]">NOW</span>() -{' '}
        <span className="text-[oklch(0.78_0.17_60)]">'7 days'</span>
        {'\n'}
        <span className="text-[oklch(0.78_0.16_295)]">GROUP BY</span> a.id{'\n'}
        <span className="text-[oklch(0.78_0.16_295)]">ORDER BY</span> plays{' '}
        <span className="text-[oklch(0.78_0.16_295)]">DESC</span>
        {'\n'}
        <span className="text-[oklch(0.78_0.16_295)]">LIMIT</span>{' '}
        <span className="text-[oklch(0.78_0.17_60)]">10</span>;
      </pre>
    </div>
  );
}

function QueryResultCard() {
  const rows = [
    { name: 'Phoebe Bridgers', plays: 74, width: '100%' },
    { name: 'Tycho', plays: 52, width: '70%' },
    { name: 'Bonobo', plays: 41, width: '55%' },
    { name: 'King Krule', plays: 28, width: '38%' },
  ];
  return (
    <div className="absolute bottom-5 right-5 w-64 rounded-xl bg-white/95 p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-fg-muted">
        Query result · 14ms
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.name}>
            <div className="flex justify-between text-[11px] font-semibold text-fg-strong">
              <span>{row.name}</span>
              <span className="text-fg-muted">{row.plays}</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-sm bg-surface-sunken">
              <div
                className="h-full rounded-sm"
                style={{
                  width: row.width,
                  background:
                    'linear-gradient(90deg, var(--color-violet-500), var(--color-indigo-500))',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
