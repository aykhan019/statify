import { cn } from '@/lib/utils/cn';

export interface EqualizerProps {
  size?: number;
  className?: string;
  /** Disables animation. Used in test surfaces and reduce-motion is also honored globally. */
  static?: boolean;
}

/**
 * Currently-playing affordance per DESIGN.md §8.6. Single allowed
 * non-Lucide icon in the system. Three bars pulse via the
 * --animate-pulse-eq keyframes defined in globals.css.
 */
export function Equalizer({ size = 16, className, static: isStatic = false }: EqualizerProps) {
  const barWidth = size / 5;
  const gap = barWidth / 2;
  const animClass = isStatic ? '' : 'motion-eq-bar';
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      focusable="false"
      className={cn('inline-block', className)}
    >
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={i * (barWidth + gap)}
          y={0}
          width={barWidth}
          height={size}
          rx={barWidth / 2}
          fill="currentColor"
          className={animClass}
        />
      ))}
    </svg>
  );
}
