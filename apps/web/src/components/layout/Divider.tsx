import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerTone = 'default' | 'strong' | 'section';

const dividerTone: Record<DividerTone, string> = {
  default: 'border-border-default',
  strong: 'border-border-strong',
  section: 'border-section-accent',
};

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  tone?: DividerTone;
}

export function Divider({
  orientation = 'horizontal',
  tone = 'default',
  className,
  ...props
}: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0',
        orientation === 'horizontal' ? 'w-full border-t' : 'self-stretch border-l',
        dividerTone[tone],
        className,
      )}
      {...props}
    />
  );
}
