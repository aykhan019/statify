'use client';

import type { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils/cn';

export interface ChartContainerProps {
  ariaLabel?: string;
  children: ReactElement;
  className?: string;
  height?: number;
}

export function ChartContainer({
  ariaLabel,
  children,
  className,
  height = 320,
}: ChartContainerProps) {
  return (
    <div
      className={cn('min-w-0 overflow-hidden', className)}
      style={{ width: '100%', height }}
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}
