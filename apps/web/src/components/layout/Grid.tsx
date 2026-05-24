import { cn } from '@/lib/utils/cn';
import { getLayoutElement, type LayoutPrimitiveProps } from './types';

export type GridColumns = 'one' | 'two' | 'three' | 'four';
export type LayoutGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'section';

const gridColumns: Record<GridColumns, string> = {
  one: 'grid-cols-1',
  two: 'grid-cols-1 md:grid-cols-2',
  three: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  four: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export const layoutGap: Record<LayoutGap, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  section: 'gap-10',
};

export interface GridProps extends LayoutPrimitiveProps {
  columns?: GridColumns;
  gap?: LayoutGap;
}

export function Grid({ as, columns = 'three', gap = 'lg', className, ...props }: GridProps) {
  const Component = getLayoutElement(as, 'div');

  return (
    <Component className={cn('grid', gridColumns[columns], layoutGap[gap], className)} {...props} />
  );
}
