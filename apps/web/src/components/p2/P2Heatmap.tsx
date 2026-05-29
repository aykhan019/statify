'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

export interface P2HeatmapProps {
  counts: number[][];
  className?: string;
}

interface Tip {
  x: number;
  y: number;
  label: string;
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, h) => h);
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function P2Heatmap({ counts, className }: P2HeatmapProps) {
  const [tip, setTip] = useState<Tip | null>(null);

  const flat = counts.flat();
  const max = flat.length > 0 ? Math.max(...flat) : 0;

  const colorFor = (count: number): string => {
    if (count === 0 || max === 0) {
      return 'var(--color-chart-heatmap-0)';
    }
    const stop = Math.min(4, Math.floor((count / max) * 5));
    return `var(--color-chart-heatmap-${Math.max(0, stop)})`;
  };

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className="min-w-[640px]">
        <div
          className="grid gap-1 text-[10px] text-fg-muted"
          style={{ gridTemplateColumns: '48px repeat(24, minmax(0, 1fr))' }}
        >
          <span />
          {HOUR_LABELS.map((h) => (
            <span key={h} className="text-center font-mono tabular-nums">
              {h % 3 === 0 ? h : ''}
            </span>
          ))}
        </div>
        {DAY_LABELS.map((day, dIndex) => (
          <div
            key={day}
            className="mt-1 grid gap-1"
            style={{ gridTemplateColumns: '48px repeat(24, minmax(0, 1fr))' }}
          >
            <span className="self-center font-mono text-[11px] text-fg-muted">{day}</span>
            {HOUR_LABELS.map((hour) => {
              const count = counts[dIndex]?.[hour] ?? 0;
              const label = `${day} ${String(hour).padStart(2, '0')}:00 — ${count} ${count === 1 ? 'play' : 'plays'}`;
              return (
                <span
                  key={hour}
                  aria-label={label}
                  onMouseEnter={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    setTip({ x: rect.left + rect.width / 2, y: rect.top, label });
                  }}
                  onMouseLeave={() => setTip(null)}
                  className="block aspect-square rounded-(--radius-xs) border border-border-default/60"
                  style={{ backgroundColor: colorFor(count) }}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-3 flex items-center justify-end gap-2 font-mono text-[10px] text-fg-muted">
          <span>less</span>
          {[0, 1, 2, 3, 4].map((stop) => (
            <span
              key={stop}
              className="size-3 rounded-(--radius-xs) border border-border-default/60"
              style={{ backgroundColor: `var(--color-chart-heatmap-${stop})` }}
            />
          ))}
          <span>more</span>
        </div>
      </div>
      {tip !== null &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-(--radius-sm) border border-border-strong bg-surface-work px-2 py-1 font-mono text-[11px] text-fg-strong shadow-lg"
            style={{ left: tip.x, top: tip.y - 6 }}
          >
            {tip.label}
          </div>,
          document.body,
        )}
    </div>
  );
}
