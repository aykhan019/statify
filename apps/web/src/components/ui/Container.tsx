import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

const SIZE_CLASSES: Record<ContainerSize, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { className, size = 'lg', ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn('mx-auto w-full px-4 sm:px-6', SIZE_CLASSES[size], className)}
      {...rest}
    />
  );
});
