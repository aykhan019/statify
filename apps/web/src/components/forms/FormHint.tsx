import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface FormHintProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function FormHint({ className, children, ...rest }: FormHintProps) {
  return (
    <p className={cn('text-xs text-fg-muted', className)} {...rest}>
      {children}
    </p>
  );
}
