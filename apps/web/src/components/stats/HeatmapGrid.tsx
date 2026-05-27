'use client';

import type { HeatmapCell } from '@statify/shared';
import { HEATMAP_DAYS, HEATMAP_HOURS } from '@statify/shared';
import { useState } from 'react';
import { CHART_HEATMAP_STOPS, getChartHeatmapColor } from '@/components/charts/theme';
import { cn } from '@/lib/utils/cn';

interface HeatmapGridProps {
  cells: HeatmapCell[];
}

interface HoveredCell {
  label: string;
  x: number;
  y: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HeatmapGrid({ cells }: HeatmapGridProps) {
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const counts = new Map<number, number>();
  let max = 0;
  let peakDay = 0;
  let peakHour = 0;
  for (const cell of cells) {
    const key = cell.dayOfWeek * HEATMAP_HOURS + cell.hourOfDay;
    counts.set(key, cell.listenCount);
    if (cell.listenCount > max) {
      max = cell.listenCount;
      peakDay = cell.dayOfWeek;
      peakHour = cell.hourOfDay;
    }
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-flex min-w-full flex-col gap-1"
        role="img"
        aria-label={describeHeatmap(max, peakDay, peakHour)}
      >
        <div
          className="grid gap-1 text-[10px] text-fg-muted"
          style={{ gridTemplateColumns: `2.5rem repeat(${HEATMAP_HOURS}, minmax(1.25rem, 1fr))` }}
        >
          <div />
          {Array.from({ length: HEATMAP_HOURS }, (_, hour) => (
            <div key={hour} className="text-center tabular-nums">
              {hour % 3 === 0 ? hour : ''}
            </div>
          ))}
        </div>
        {Array.from({ length: HEATMAP_DAYS }, (_, day) => (
          <div
            key={day}
            className="grid gap-1"
            style={{ gridTemplateColumns: `2.5rem repeat(${HEATMAP_HOURS}, minmax(1.25rem, 1fr))` }}
          >
            <div className="self-center text-xs text-fg-muted">{DAY_LABELS[day]}</div>
            {Array.from({ length: HEATMAP_HOURS }, (_, hour) => {
              const count = counts.get(day * HEATMAP_HOURS + hour) ?? 0;
              const intensity = max === 0 ? 0 : count / max;
              const heatmapStop = Math.min(
                CHART_HEATMAP_STOPS - 1,
                Math.floor(intensity * (CHART_HEATMAP_STOPS - 1)),
              );
              const label = `${DAY_LABELS[day]} ${hour.toString().padStart(2, '0')}:00 — ${count} ${
                count === 1 ? 'play' : 'plays'
              }`;
              return (
                <div
                  key={hour}
                  onMouseMove={(event) => setHovered({ label, x: event.clientX, y: event.clientY })}
                  onMouseLeave={() => setHovered(null)}
                  className={cn(
                    'aspect-square min-h-5 rounded-(--radius-xs) border',
                    count === 0 && 'bg-surface-sunken',
                  )}
                  style={
                    count === 0 ? undefined : { backgroundColor: getChartHeatmapColor(heatmapStop) }
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-fg-muted">
        Darker cells indicate more plays. Hover a cell for the exact count.
      </p>

      {hovered !== null && (
        <div
          role="tooltip"
          className="border-border-default bg-surface-raised text-fg-strong pointer-events-none fixed z-50 rounded-(--radius-sm) border px-2 py-1 text-xs shadow-lg"
          style={{ left: hovered.x + 12, top: hovered.y + 12 }}
        >
          {hovered.label}
        </div>
      )}
    </div>
  );
}

function describeHeatmap(max: number, peakDay: number, peakHour: number): string {
  if (max === 0) {
    return 'Listening heatmap by day and hour. No plays in the selected period.';
  }

  return `Listening heatmap by day and hour. Peak cell is ${DAY_LABELS[peakDay]} ${peakHour
    .toString()
    .padStart(2, '0')}:00 with ${max} plays.`;
}
