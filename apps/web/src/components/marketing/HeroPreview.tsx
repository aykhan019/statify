/**
 * Three glass cards stacked at angles inside the hero — a sample chart,
 * a top-artists list, and a now-playing pill. They preview what the
 * actual product surfaces look like without needing real data.
 *
 * Static; no client state needed.
 */
export function HeroPreview() {
  return (
    <div className="relative h-[520px]">
      {/* Back card: minutes-listened chart */}
      <div className="absolute right-0 top-10 w-[380px] rotate-[3deg] rounded-3xl border border-white/15 bg-white/[0.06] p-6 text-fg-on-block shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
          Minutes listened · 30d
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <div className="text-3xl font-bold tracking-tight">
            1,284<span className="ml-1.5 text-sm font-normal text-white/55">min</span>
          </div>
          <div className="text-xs font-semibold" style={{ color: 'var(--color-green-200)' }}>
            ↑ 18%
          </div>
        </div>
        <svg viewBox="0 0 280 80" className="mt-2 block w-full">
          <defs>
            <linearGradient id="hp-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--color-azure-400)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--color-azure-400)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 60 L20 50 L40 56 L60 36 L80 42 L100 26 L120 32 L140 18 L160 24 L180 14 L200 30 L220 22 L240 36 L260 24 L280 28 L280 80 L0 80 Z"
            fill="url(#hp-area)"
          />
          <path
            d="M0 60 L20 50 L40 56 L60 36 L80 42 L100 26 L120 32 L140 18 L160 24 L180 14 L200 30 L220 22 L240 36 L260 24 L280 28"
            stroke="var(--color-azure-400)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Middle card: top artists */}
      <div className="absolute right-[220px] top-[220px] w-[280px] -rotate-[4deg] rounded-2xl border border-white/15 bg-white/[0.08] p-4.5 text-fg-on-block shadow-[0_24px_50px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
          Top artists · this week
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {ARTISTS.map((a) => (
            <div key={a.rank} className="flex items-center gap-3">
              <div
                className="size-7 rounded-md"
                style={{
                  background: `linear-gradient(135deg, ${a.color}, var(--color-indigo-700))`,
                }}
              />
              <div className="flex-1 text-[13px] font-semibold">{a.name}</div>
              <div className="text-[11px] text-white/55">{a.plays} plays</div>
            </div>
          ))}
        </div>
      </div>

      {/* Front card: now playing pill */}
      <div className="absolute bottom-0 left-0 flex w-[320px] items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.1] p-4 text-fg-on-block shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div
          className="grid size-14 place-items-center rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, var(--color-magenta-500), var(--color-violet-700))',
            boxShadow:
              '0 10px 30px -10px color-mix(in oklch, var(--color-violet-500) 60%, transparent)',
          }}
        >
          <div className="flex h-5 items-end gap-[2px]">
            {[8, 14, 10, 16].map((h, i) => (
              <div
                key={i}
                className="motion-reduce:!animate-none motion-reduce:!scale-100"
                style={{
                  width: 3,
                  background: '#fff',
                  borderRadius: 1,
                  height: h,
                  transformOrigin: 'bottom',
                  animation: `statify-bar-pulse 1.2s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--color-green-200)' }}
          >
            ▶ Now playing
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold">Motion Sickness</div>
          <div className="truncate text-[11px] text-white/60">
            Phoebe Bridgers · Stranger in the Alps
          </div>
        </div>
      </div>
    </div>
  );
}

const ARTISTS = [
  { rank: 1, name: 'Phoebe Bridgers', plays: 74, color: 'var(--color-magenta-500)' },
  { rank: 2, name: 'Tycho', plays: 52, color: 'var(--color-teal-500)' },
  { rank: 3, name: 'Bonobo', plays: 41, color: 'var(--color-violet-500)' },
];
