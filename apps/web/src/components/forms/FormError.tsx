import { AlertCircle } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';

export interface FormErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  /**
   * `field` (default): inline hint-sized message under a Field.
   * `summary`: top-of-form banner with a leading alert icon for
   * server-side / submit-level errors.
   */
  variant?: 'field' | 'summary';
}

export function FormError({ className, children, variant = 'field', ...rest }: FormErrorProps) {
  if (variant === 'summary') {
    return (
      <p
        role="alert"
        className={cn(
          'flex items-start gap-2 rounded-(--radius-sm) border px-3 py-2 text-sm',
          'border-state-error-border bg-state-error-bg text-state-error-fg',
          className,
        )}
        {...rest}
      >
        <Icon as={AlertCircle} size="sm" className="mt-0.5 shrink-0" />
        <span>{children}</span>
      </p>
    );
  }

  return (
    <p role="alert" className={cn('text-xs text-state-error-fg', className)} {...rest}>
      {children}
    </p>
  );
}
