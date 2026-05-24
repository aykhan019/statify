'use client';

import { Loader2 } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';

export interface SubmitButtonProps extends ButtonProps {
  /** Render the inflight state: shows a spinner and swaps the label. */
  loading?: boolean;
  /** Optional label override for the loading state. */
  loadingLabel?: ReactNode;
}

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(function SubmitButton(
  { loading = false, loadingLabel, disabled, children, className, ...rest },
  ref,
) {
  return (
    <Button
      ref={ref}
      type="submit"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(loading && 'cursor-progress', className)}
      {...rest}
    >
      {loading && <Icon as={Loader2} size="sm" className="motion-spinner" />}
      <span>{loading ? (loadingLabel ?? children) : children}</span>
    </Button>
  );
});
