import { AlertTriangle, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon, type IconProps } from '@/components/ui/Icon';
import { StatePanel } from './StatePanel';

interface ErrorStateProps {
  title?: string;
  description?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: IconProps['as'];
  className?: string;
}

/**
 * Failed-fetch state. Error tone with `role="alert"`. When `onRetry` is
 * provided (e.g. the App Router `reset` from an `error.tsx` boundary), renders
 * a retry button. The retry handler is supplied by a client boundary.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'This view could not be loaded. Try again in a moment.',
  onRetry,
  retryLabel = 'Try again',
  icon = AlertTriangle,
  className,
}: ErrorStateProps) {
  return (
    <StatePanel
      tone="error"
      role="alert"
      icon={icon}
      title={title}
      description={description}
      className={className}
      action={
        onRetry === undefined ? undefined : (
          <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
            <Icon as={RotateCcw} size="sm" />
            {retryLabel}
          </Button>
        )
      }
    />
  );
}
