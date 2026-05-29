import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface P2MiniLineProps {
  data: readonly number[];
  height?: number;
  className?: string;
  ariaLabel?: string;
  showDots?: boolean;
  showAvg?: boolean;
  showGrid?: boolean;
}

// eslint-disable-next-line complexity
export function P2MiniLine({
  data,
  height = 90,
  className,
  ariaLabel,
  showDots = false,
  showAvg = false,
  showGrid = false,
}: P2MiniLineProps) {
  if (data.length === 0) {
    return null;
  }

  const w = 280;
  const h = height;
  const pad = 6;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const avg = data.reduce((sum, v) => sum + v, 0) / data.length;

  const xs = (i: number) => pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
  const ys = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const avgY = ys(avg);

  const points = data.map((v, i) => [xs(i), ys(v)] as const);
  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${(w - pad).toFixed(1)} ${(h - pad).toFixed(1)} L ${pad} ${(h - pad).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      className={cn('block w-full', className)}
      style={{ height }}
    >
      <defs>
        <linearGradient id="p2-mini-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--section-accent)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--section-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {showGrid &&
        [0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={pad}
            x2={w - pad}
            y1={pad + (h - pad * 2) * t}
            y2={pad + (h - pad * 2) * t}
            stroke="color-mix(in oklch, var(--fg-muted) 18%, transparent)"
            strokeDasharray="3 4"
            strokeWidth={1}
          />
        ))}
      <path d={areaPath} fill="url(#p2-mini-grad)" />
      <path
        d={linePath}
        stroke="var(--section-accent)"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showAvg && (
        <>
          <line
            x1={pad}
            x2={w - pad}
            y1={avgY}
            y2={avgY}
            stroke="color-mix(in oklch, var(--fg-muted) 35%, transparent)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        </>
      )}
      {showDots &&
        points
          .filter((_, i) => i % 5 === 0 || i === points.length - 1)
          .map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={2.5} fill="var(--section-accent)" />
          ))}
    </svg>
  );
}

export type PodiumTone =
  | 'magenta'
  | 'indigo'
  | 'violet'
  | 'teal'
  | 'cyan'
  | 'coral'
  | 'amber'
  | 'green';

export interface PodiumEntry {
  name: string;
  caption: ReactNode;
  tone?: PodiumTone;
  href?: string;
  imageUrl?: string | null;
}

export interface P2PodiumProps {
  entries: readonly [PodiumEntry, PodiumEntry, PodiumEntry];
  className?: string;
  size?: 'sm' | 'lg';
}

const TONE_GRADIENT: Record<PodiumTone, string> = {
  magenta: 'linear-gradient(135deg, var(--color-magenta-500), var(--color-violet-700))',
  indigo: 'linear-gradient(135deg, var(--color-indigo-500), var(--color-indigo-900))',
  violet: 'linear-gradient(135deg, var(--color-violet-500), var(--color-magenta-700))',
  teal: 'linear-gradient(135deg, var(--color-teal-500), var(--color-indigo-700))',
  cyan: 'linear-gradient(135deg, var(--color-cyan-500), var(--color-azure-700))',
  coral: 'linear-gradient(135deg, var(--color-coral-500), var(--color-vermilion-700))',
  amber: 'linear-gradient(135deg, var(--color-amber-500), var(--color-coral-700))',
  green: 'linear-gradient(135deg, var(--color-green-500), var(--color-teal-700))',
};

const TONE_BAR: Record<PodiumTone, string> = {
  magenta:
    'linear-gradient(180deg, color-mix(in oklch, var(--color-magenta-500) 75%, transparent), color-mix(in oklch, var(--color-magenta-700) 40%, transparent))',
  indigo:
    'linear-gradient(180deg, color-mix(in oklch, var(--color-indigo-500) 75%, transparent), color-mix(in oklch, var(--color-indigo-700) 40%, transparent))',
  violet:
    'linear-gradient(180deg, color-mix(in oklch, var(--color-violet-500) 75%, transparent), color-mix(in oklch, var(--color-violet-700) 40%, transparent))',
  teal: 'linear-gradient(180deg, color-mix(in oklch, var(--color-teal-500) 75%, transparent), color-mix(in oklch, var(--color-teal-700) 40%, transparent))',
  cyan: 'linear-gradient(180deg, color-mix(in oklch, var(--color-cyan-500) 75%, transparent), color-mix(in oklch, var(--color-cyan-700) 40%, transparent))',
  coral:
    'linear-gradient(180deg, color-mix(in oklch, var(--color-coral-500) 75%, transparent), color-mix(in oklch, var(--color-coral-700) 40%, transparent))',
  amber:
    'linear-gradient(180deg, color-mix(in oklch, var(--color-amber-500) 75%, transparent), color-mix(in oklch, var(--color-amber-700) 40%, transparent))',
  green:
    'linear-gradient(180deg, color-mix(in oklch, var(--color-green-500) 75%, transparent), color-mix(in oklch, var(--color-green-700) 40%, transparent))',
};

const TONES: readonly PodiumTone[] = [
  'magenta',
  'indigo',
  'violet',
  'teal',
  'cyan',
  'coral',
  'amber',
  'green',
];

function pickTone(i: number, override?: PodiumTone): PodiumTone {
  return override ?? TONES[i % TONES.length]!;
}

export function P2Podium({ entries, className, size = 'lg' }: P2PodiumProps) {
  const [second, first, third] = [entries[1], entries[0], entries[2]];
  const layout: ReadonlyArray<{
    entry: PodiumEntry;
    rank: 1 | 2 | 3;
    coverSize: number;
    barH: number;
  }> =
    size === 'lg'
      ? [
          { entry: second, rank: 2, coverSize: 84, barH: 168 },
          { entry: first, rank: 1, coverSize: 104, barH: 220 },
          { entry: third, rank: 3, coverSize: 72, barH: 144 },
        ]
      : [
          { entry: second, rank: 2, coverSize: 64, barH: 132 },
          { entry: first, rank: 1, coverSize: 80, barH: 168 },
          { entry: third, rank: 3, coverSize: 56, barH: 112 },
        ];

  return (
    <div
      className={cn('relative grid items-end gap-3 sm:gap-4', className)}
      style={{ gridTemplateColumns: '1fr 1.18fr 1fr' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-(--radius-lg)"
        style={{
          background:
            'radial-gradient(60% 70% at 50% 100%, color-mix(in oklch, var(--section-accent) 22%, transparent), transparent 70%)',
        }}
      />
      {layout.map(({ entry, rank, coverSize, barH }) => {
        const tone = pickTone(rank - 1, entry.tone);
        const initials = entry.name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0] ?? '')
          .join('')
          .toUpperCase();
        return (
          <div
            key={`${rank}-${entry.name}`}
            className="flex flex-col items-center gap-3 motion-list-item"
          >
            <div
              className="relative overflow-hidden rounded-(--radius-md) border border-white/15 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)]"
              style={{
                width: coverSize,
                height: coverSize,
                background: TONE_GRADIENT[tone],
              }}
            >
              {typeof entry.imageUrl === 'string' && entry.imageUrl.length > 0 ? (
                <Image
                  src={entry.imageUrl}
                  alt={entry.name}
                  fill
                  sizes={`${coverSize}px`}
                  className="object-cover"
                />
              ) : (
                <>
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(120% 70% at 20% 0%, rgba(255,255,255,0.28), transparent 60%)',
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute bottom-2 left-2 font-extrabold tracking-tight text-white/95"
                    style={{ fontSize: Math.round(coverSize * 0.24) }}
                  >
                    {initials || '·'}
                  </span>
                </>
              )}
            </div>
            <div className="text-center">
              <div
                className={cn(
                  'truncate font-bold tracking-tight text-fg-strong',
                  rank === 1 ? 'text-base' : 'text-sm',
                )}
                style={{ maxWidth: coverSize + 40 }}
              >
                {entry.name}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-fg-muted">{entry.caption}</div>
            </div>
            <div
              className="relative w-full overflow-hidden rounded-t-(--radius-md) border border-section-frame/35"
              style={{ height: barH, background: TONE_BAR[tone] }}
            >
              <span className="absolute inset-x-0 top-2 text-center text-2xl font-extrabold tracking-tight text-white/95">
                #{rank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface P2DeltaProps {
  value: number;
  className?: string;
}

export function P2Delta({ value, className }: P2DeltaProps) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-xs font-bold tabular-nums',
        className,
      )}
      style={{ color: positive ? 'var(--color-green-500)' : 'var(--color-vermilion-500)' }}
    >
      <span aria-hidden>{positive ? '↑' : '↓'}</span>
      {Math.abs(value)}%
    </span>
  );
}

export interface P2PillProps {
  children: ReactNode;
  tone?: 'section' | 'subtle' | 'outline' | 'on-block';
  className?: string;
  asChild?: boolean;
}

export function P2Pill({ children, tone = 'section', className }: P2PillProps) {
  const toneClass: Record<NonNullable<P2PillProps['tone']>, string> = {
    section: 'bg-section-tint text-section-accent border border-section-frame/25',
    subtle: 'bg-surface-sunken text-fg-muted border border-border-default',
    outline: 'bg-transparent text-fg-muted border border-border-default',
    'on-block': 'bg-white/16 text-white border border-white/22 backdrop-blur',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-(--radius-sm) px-2 py-1 font-mono text-[11px] font-semibold tracking-[0.02em]',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export type EntityTone = PodiumTone;

const ENTITY_GRADIENTS: Record<EntityTone, string> = TONE_GRADIENT;

export interface P2GradientCoverProps {
  tone?: EntityTone;
  name?: string;
  size?: number;
  radius?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showInitials?: boolean;
}

// eslint-disable-next-line complexity
export function P2GradientCover({
  tone = 'indigo',
  name,
  size = 48,
  radius = 'sm',
  className,
  showInitials = true,
}: P2GradientCoverProps) {
  const style: CSSProperties = {
    width: size,
    height: size,
    background: ENTITY_GRADIENTS[tone],
  };
  const initials = name
    ? name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0] ?? '')
        .join('')
        .toUpperCase()
    : '';
  return (
    <span
      aria-hidden={name === undefined ? true : undefined}
      aria-label={name}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-white/12 shadow-[0_8px_18px_-10px_rgba(0,0,0,0.45)]',
        radius === 'xs' && 'rounded-(--radius-xs)',
        radius === 'sm' && 'rounded-(--radius-sm)',
        radius === 'md' && 'rounded-(--radius-md)',
        radius === 'lg' && 'rounded-(--radius-lg)',
        className,
      )}
      style={style}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 70% at 20% 0%, rgba(255,255,255,0.24), transparent 60%)',
        }}
      />
      {showInitials && initials !== '' && (
        <span
          className="relative font-extrabold tracking-tight text-white/95"
          style={{ fontSize: Math.max(10, Math.round(size * 0.28)) }}
        >
          {initials}
        </span>
      )}
    </span>
  );
}
