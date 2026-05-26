import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';

export type DecorativeCoverTone =
  | 'amber'
  | 'azure'
  | 'coral'
  | 'cyan'
  | 'green'
  | 'indigo'
  | 'magenta'
  | 'teal'
  | 'violet';

const TONES: Record<DecorativeCoverTone, { a: string; b: string; c: string; d: string }> = {
  amber: {
    a: 'var(--color-amber-700)',
    b: 'var(--color-vermilion-500)',
    c: 'var(--color-amber-100)',
    d: 'var(--color-vermilion-900)',
  },
  azure: {
    a: 'var(--color-azure-700)',
    b: 'var(--color-cyan-500)',
    c: 'var(--color-azure-100)',
    d: 'var(--color-indigo-900)',
  },
  coral: {
    a: 'var(--color-coral-700)',
    b: 'var(--color-magenta-500)',
    c: 'var(--color-coral-100)',
    d: 'var(--color-vermilion-900)',
  },
  cyan: {
    a: 'var(--color-cyan-700)',
    b: 'var(--color-teal-500)',
    c: 'var(--color-cyan-100)',
    d: 'var(--color-azure-900)',
  },
  green: {
    a: 'var(--color-green-700)',
    b: 'var(--color-lime-500)',
    c: 'var(--color-green-100)',
    d: 'var(--color-teal-900)',
  },
  indigo: {
    a: 'var(--color-indigo-700)',
    b: 'var(--color-azure-500)',
    c: 'var(--color-indigo-100)',
    d: 'var(--color-indigo-900)',
  },
  magenta: {
    a: 'var(--color-magenta-700)',
    b: 'var(--color-coral-500)',
    c: 'var(--color-magenta-100)',
    d: 'var(--color-pink-900)',
  },
  teal: {
    a: 'var(--color-teal-700)',
    b: 'var(--color-green-500)',
    c: 'var(--color-teal-100)',
    d: 'var(--color-cyan-900)',
  },
  violet: {
    a: 'var(--color-violet-700)',
    b: 'var(--color-indigo-500)',
    c: 'var(--color-violet-100)',
    d: 'var(--color-violet-900)',
  },
};

export function DecorativeCoverTile({
  className,
  tone,
}: {
  className?: string;
  tone: DecorativeCoverTone;
}) {
  const colors = TONES[tone];
  const style = {
    '--cover-a': colors.a,
    '--cover-b': colors.b,
    '--cover-c': colors.c,
    '--cover-d': colors.d,
    background: 'linear-gradient(135deg, var(--cover-a), var(--cover-b))',
  } as CSSProperties;

  return (
    <div aria-hidden="true" className={cn('relative overflow-hidden', className)} style={style}>
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(circle at 24% 22%, var(--cover-c) 0 10%, transparent 11%), radial-gradient(circle at 76% 76%, var(--cover-d) 0 22%, transparent 23%)',
        }}
      />
      <div className="absolute top-[18%] -left-[18%] h-[18%] w-[140%] -rotate-12 bg-[var(--cover-c)] opacity-65" />
      <div className="absolute right-[10%] bottom-[12%] aspect-square w-[46%] rounded-full border border-[var(--cover-c)] opacity-60" />
      <div className="absolute inset-x-[16%] bottom-[17%] h-[6%] rounded-(--radius-full) bg-[var(--cover-d)] opacity-50" />
    </div>
  );
}
