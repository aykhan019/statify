import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  function Label({ className, ...rest }, ref) {
    return (
      <label
        ref={ref}
        className={cn(
          'text-foreground text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className,
        )}
        {...rest}
      />
    );
  },
);
