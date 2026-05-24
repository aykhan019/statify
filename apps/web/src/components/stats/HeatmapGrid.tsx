import type { HeatmapCell } from '@statify/shared';
import { HEATMAP_DAYS, HEATMAP_HOURS } from '@statify/shared';
import { CHART_HEATMAP_STOPS, getChartHeatmapColor } from '@/components/charts/theme';
import { cn } from '@/lib/utils/cn';

interface HeatmapGridProps {
  cells: HeatmapCell[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HeatmapGrid({ cells }: HeatmapGridProps) {
  const counts = new Map<number, number>();
  let max = 0;
  for (const cell of cells) {
    const key = cell.dayOfWeek * HEATMAP_HOURS + cell.hourOfDay;
    counts.set(key, cell.listenCount);
    if (cell.listenCount > max) {
      max = cell.listenCount;
    }
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full flex-col gap-1">
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
              return (
                <div
                  key={hour}
                  title={`${DAY_LABELS[day]} ${hour.toString().padStart(2, '0')}:00 — ${count} plays`}
                  className={cn(
                    'aspect-square min-h-5 rounded-(--radius-xs) border',
                    count === 0 && 'bg-surface-sunken',
                  )}
                  style={
                    count === 0
                      ? undefined
                      : {
                          backgroundColor: getChartHeatmapColor(heatmapStop),
                        }
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
    </div>
  );
}
