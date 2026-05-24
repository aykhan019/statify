import { cn } from '@/lib/utils/cn';
import { getLayoutElement, type LayoutPrimitiveProps } from './types';

export type ContainerSize = 'narrow' | 'prose' | 'wide' | 'full' | 'bleed';
export type ContainerGutter = 'none' | 'compact' | 'page';

const containerSize: Record<ContainerSize, string> = {
  narrow: 'max-w-(--container-narrow)',
  prose: 'max-w-(--container-prose)',
  wide: 'max-w-(--container-wide)',
  full: 'max-w-(--container-full)',
  bleed: 'max-w-none',
};

const containerGutter: Record<ContainerGutter, string> = {
  none: 'px-0',
  compact: 'px-3 sm:px-4 md:px-5',
  page: 'px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10',
};

export interface ContainerProps extends LayoutPrimitiveProps {
  size?: ContainerSize;
  gutter?: ContainerGutter;
  centered?: boolean;
}

export function Container({
  as,
  size = 'wide',
  gutter = 'page',
  centered = true,
  className,
  ...props
}: ContainerProps) {
  const Component = getLayoutElement(as, 'div');

  return (
    <Component
      className={cn(
        'w-full',
        centered && 'mx-auto',
        containerSize[size],
        containerGutter[gutter],
        className,
      )}
      {...props}
    />
  );
}
