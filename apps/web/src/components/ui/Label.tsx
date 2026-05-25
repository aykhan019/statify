import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  function Label({ children, className, htmlFor, ...rest }, ref) {
    return (
      <label
        ref={ref}
        htmlFor={htmlFor}
        className={cn(
          'text-foreground text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className,
        )}
        {...rest}
      >
        {children}
      </label>
    );
  },
);
