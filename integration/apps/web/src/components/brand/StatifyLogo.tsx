import type { SVGProps } from 'react';
import { cn } from '@/lib/utils/cn';

interface StatifyLogoProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Square edge length in pixels. Defaults to 40. */
  size?: number;
  /**
   * When true, omits the solid rounded background so the mark sits
   * directly on a parent surface (e.g. inline with a wordmark).
   */
  bare?: boolean;
  /** Optional title for AT; defaults to "Statify". */
  title?: string;
}

/**
 * The Statify S-Wave mark. The letter S is drawn as a stroked waveform,
 * tinted across the section accent (purple → indigo → teal), with audio
 * amplitude ticks slotted into the curves.
 *
 * Colors reference the raw palette tokens defined in globals.css so the
 * mark reads correctly in both light and dark themes.
 */
export function StatifyLogo({
  size = 40,
  bare = false,
  title = 'Statify',
  className,
  ...props
}: StatifyLogoProps) {
  const gradientId = `statify-sw-${bare ? 'bare' : 'tile'}`;

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      {...props}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-violet-500)" />
          <stop offset="0.55" stopColor="var(--color-indigo-500)" />
          <stop offset="1" stopColor="var(--color-teal-500)" />
        </linearGradient>
      </defs>

      {!bare && <rect x="6" y="6" width="108" height="108" rx="28" fill="var(--surface-page)" />}

      <path
        d="M86 38 C 80 24, 50 24, 42 38 C 32 56, 88 64, 78 84 C 70 100, 36 100, 32 84"
        stroke={`url(#${gradientId})`}
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />

      <g stroke="var(--color-green-200)" strokeLinecap="round" strokeWidth="3">
        <line x1="44" y1="46" x2="44" y2="54" />
        <line x1="56" y1="42" x2="56" y2="58" />
        <line x1="68" y1="44" x2="68" y2="52" />
        <line x1="50" y1="72" x2="50" y2="84" />
        <line x1="62" y1="68" x2="62" y2="88" />
        <line x1="74" y1="72" x2="74" y2="80" />
      </g>
    </svg>
  );
}
