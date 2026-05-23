import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Skeleton({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn('bg-muted animate-pulse rounded-(--radius-sm)', className)}
        {...rest}
      />
    );
  },
);
