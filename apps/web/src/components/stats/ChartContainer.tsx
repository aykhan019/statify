'use client';

import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils/cn';

interface ChartContainerProps {
  children: ReactElement;
  height?: number;
  className?: string;
  ariaLabel?: string;
}

export function ChartContainer({
  children,
  height = 320,
  className,
  ariaLabel,
}: ChartContainerProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }} role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-chart-tooltip-bg)',
  border: '1px solid var(--color-chart-tooltip-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-chart-tooltip-fg)',
  fontSize: '0.875rem',
  padding: '0.5rem 0.75rem',
} as const;

export const CHART_GRID_STROKE = 'var(--color-chart-grid)';
export const CHART_AXIS_FILL = 'var(--color-chart-axis)';
export const CHART_BAR_FILL = 'var(--color-chart-series-0)';
