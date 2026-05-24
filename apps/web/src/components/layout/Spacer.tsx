import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type SpacerSize =
  | '0'
  | 'px'
  | '0.5'
  | '1'
  | '1.5'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '8'
  | '10'
  | '12'
  | '16'
  | '20'
  | '24'
  | '32'
  | '40'
  | '48';

export type SpacerAxis = 'vertical' | 'horizontal';

const spacerHeight: Record<SpacerSize, string> = {
  '0': 'h-0',
  px: 'h-px',
  '0.5': 'h-0.5',
  '1': 'h-1',
  '1.5': 'h-1.5',
  '2': 'h-2',
  '3': 'h-3',
  '4': 'h-4',
  '5': 'h-5',
  '6': 'h-6',
  '8': 'h-8',
  '10': 'h-10',
  '12': 'h-12',
  '16': 'h-16',
  '20': 'h-20',
  '24': 'h-24',
  '32': 'h-32',
  '40': 'h-40',
  '48': 'h-48',
};

const spacerWidth: Record<SpacerSize, string> = {
  '0': 'w-0',
  px: 'w-px',
  '0.5': 'w-0.5',
  '1': 'w-1',
  '1.5': 'w-1.5',
  '2': 'w-2',
  '3': 'w-3',
  '4': 'w-4',
  '5': 'w-5',
  '6': 'w-6',
  '8': 'w-8',
  '10': 'w-10',
  '12': 'w-12',
  '16': 'w-16',
  '20': 'w-20',
  '24': 'w-24',
  '32': 'w-32',
  '40': 'w-40',
  '48': 'w-48',
};

export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpacerSize;
  axis?: SpacerAxis;
}

export function Spacer({ size = '4', axis = 'vertical', className, ...props }: SpacerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'shrink-0',
        axis === 'vertical' ? spacerHeight[size] : spacerWidth[size],
        className,
      )}
      {...props}
    />
  );
}
