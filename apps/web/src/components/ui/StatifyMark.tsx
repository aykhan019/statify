import type { SVGProps } from 'react';

interface StatifyMarkProps extends SVGProps<SVGSVGElement> {
  /** Accessible label; when omitted the mark is treated as decorative. */
  title?: string;
}

/**
 * The Statify "S-wave" brand mark (transparent), rendered inline so it stays crisp and inherits
 * sizing/color context. Use the solid app icon (app/icon.svg) for favicons/PWA.
 */
export function StatifyMark({ title, ...props }: StatifyMarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-hidden={title === undefined ? true : undefined}
      aria-label={title}
      {...props}
    >
      {title !== undefined && <title>{title}</title>}
      <defs>
        <linearGradient id="statify-wave" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="0.55" stopColor="#3A6FF5" />
          <stop offset="1" stopColor="#15B8A6" />
        </linearGradient>
      </defs>
      <path
        d="M86 38 C 80 24, 50 24, 42 38 C 32 56, 88 64, 78 84 C 70 100, 36 100, 32 84"
        stroke="url(#statify-wave)"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      <g stroke="#15B8A6" strokeLinecap="round" strokeWidth="3">
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
