import { StatifyLogo } from '@/components/brand/StatifyLogo';

/**
 * Brand panel rendered on the left half of the auth shell at the lg+
 * breakpoint. Below lg it collapses (the AuthShell wraps the form to
 * full width and shows the wordmark in the header instead).
 *
 * All copy is editorial placeholder — replace with whatever ships in
 * the marketing copy doc.
 */
export function AuthBrandPanel() {
  return (
    <aside
      className="relative z-10 hidden h-full flex-col justify-between p-12 text-fg-on-block lg:flex"
      aria-label="Statify product highlights"
    >
      <header className="flex items-center gap-3">
        <StatifyLogo size={40} bare />
        <span className="text-2xl font-bold tracking-tight">Statify</span>
      </header>

      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-section-accent">
          The story behind your listening
        </p>
        <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight text-fg-on-block">
          Your year in music,
          <br />
          every day.
        </h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-fg-on-block/75">
          Statify turns every stream into stories — top tracks, hidden gems, mood graphs, and the
          artists shaping your week.
        </p>

        <dl className="mt-10 grid grid-cols-3 gap-6">
          <BrandStat value="180M" label="Tracks tracked" />
          <BrandStat value="24h" label="Median rebuild" />
          <BrandStat value="4.9★" label="App rating" />
        </dl>
      </div>

      <footer className="text-xs text-fg-on-block/55">
        © {new Date().getFullYear()} Statify · Built on the Spotify Million Playlist Dataset
      </footer>
    </aside>
  );
}

interface BrandStatProps {
  value: string;
  label: string;
}

function BrandStat({ value, label }: BrandStatProps) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-fg-on-block/55">{label}</dt>
      <dd className="mt-1 text-2xl font-bold tracking-tight text-fg-on-block">{value}</dd>
    </div>
  );
}
