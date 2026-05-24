import { getChartSeriesColor } from './theme';

export interface ChartLegendItem {
  color?: string;
  label: string;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-fg-muted">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-(--radius-full)"
            style={{ backgroundColor: item.color ?? getChartSeriesColor(index) }}
          />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
