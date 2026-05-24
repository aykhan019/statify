import type { CSSProperties } from 'react';

export const CHART_SERIES_COUNT = 8;
export const CHART_HEATMAP_STOPS = 5;

export const chartTooltipStyle: CSSProperties = {
  backgroundColor: 'var(--color-chart-tooltip-bg)',
  border: '1px solid var(--color-chart-tooltip-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-chart-tooltip-fg)',
  fontSize: '0.875rem',
  padding: '0.5rem 0.75rem',
};

export const chartAxisTick = {
  fill: 'var(--color-chart-axis)',
  fontSize: 12,
} as const;

export const chartBarRadius: [number, number, number, number] = [0, 4, 4, 0];
export const chartAxisColor = 'var(--color-chart-axis)';
export const chartGridColor = 'var(--color-chart-grid)';
export const chartTooltipCursor = { fill: 'var(--color-section-row-hover)' } as const;

export function getChartSeriesColor(index: number): string {
  return `var(--color-chart-series-${normalizeIndex(index, CHART_SERIES_COUNT)})`;
}

export function getChartHeatmapColor(index: number): string {
  return `var(--color-chart-heatmap-${normalizeIndex(index, CHART_HEATMAP_STOPS)})`;
}

function normalizeIndex(index: number, size: number): number {
  return ((index % size) + size) % size;
}
