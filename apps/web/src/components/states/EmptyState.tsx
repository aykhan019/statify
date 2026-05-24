import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import type { IconProps } from '@/components/ui/Icon';
import { StatePanel } from './StatePanel';

interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: IconProps['as'];
  className?: string;
}

/**
 * Zero-length result state. Neutral, non-alarming: a dashed recess with a
 * section-hue chip. Used when a fetch succeeds but returns no rows.
 */
export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <StatePanel
      tone="neutral"
      role="status"
      icon={icon}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}
