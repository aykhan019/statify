import { forwardRef, type LabelHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, required = false, optional = false, children, ...rest },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn(
        'flex items-baseline gap-1 text-sm font-medium text-fg-strong',
        'has-[+*:disabled]:text-fg-faint',
        className,
      )}
      {...rest}
    >
      <span>{children}</span>
      {required && (
        <span aria-hidden="true" className="text-state-error-fg">
          *
        </span>
      )}
      {!required && optional && (
        <span className="font-mono text-[0.6875rem] font-normal uppercase tracking-[0.04em] text-fg-faint">
          optional
        </span>
      )}
    </label>
  );
});
