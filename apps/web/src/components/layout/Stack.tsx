import { cn } from '@/lib/utils/cn';
import { layoutGap, type LayoutGap } from './Grid';
import { getLayoutElement, type LayoutPrimitiveProps } from './types';

export type StackDirection = 'vertical' | 'horizontal' | 'responsive';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'between' | 'end';

const stackDirection: Record<StackDirection, string> = {
  vertical: 'flex-col',
  horizontal: 'flex-row',
  responsive: 'flex-col sm:flex-row',
};

const stackAlign: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const stackJustify: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  between: 'justify-between',
  end: 'justify-end',
};

export interface StackProps extends LayoutPrimitiveProps {
  direction?: StackDirection;
  gap?: LayoutGap;
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
}

export function Stack({
  as,
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
  ...props
}: StackProps) {
  const Component = getLayoutElement(as, 'div');

  return (
    <Component
      className={cn(
        'flex',
        stackDirection[direction],
        layoutGap[gap],
        stackAlign[align],
        stackJustify[justify],
        wrap && 'flex-wrap',
        className,
      )}
      {...props}
    />
  );
}
