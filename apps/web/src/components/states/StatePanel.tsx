import type { ReactNode } from 'react';
import { Icon, type IconProps } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';

export type StateTone = 'neutral' | 'error';

interface StatePanelProps {
  icon: IconProps['as'];
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: StateTone;
  role?: 'status' | 'alert';
  className?: string;
}

const TONE: Record<StateTone, { container: string; chip: string; title: string }> = {
  neutral: {
    container: 'border-border-default border-dashed bg-surface-sunken',
    chip: 'bg-section-tint text-section-accent',
    title: 'text-fg-strong',
  },
  error: {
    container: 'border-state-error-border bg-state-error-bg',
    chip: 'bg-surface-work text-state-error-fg',
    title: 'text-state-error-fg',
  },
};

/**
 * Shared visual shell for empty / error / not-found states: a centered column
 * with a hue chip, title, optional description, and optional action. Only the
 * tone (neutral vs error border + chip) varies between the three primitives.
 */
export function StatePanel({
  icon,
  title,
  description,
  action,
  tone = 'neutral',
  role = 'status',
  className,
}: StatePanelProps) {
  const tokens = TONE[tone];
  return (
    <div
      role={role}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-(--radius-lg) border px-6 py-16 text-center',
        tokens.container,
        className,
      )}
    >
      <span
        className={cn(
          'flex size-12 items-center justify-center rounded-(--radius-full)',
          tokens.chip,
        )}
      >
        <Icon as={icon} size="lg" />
      </span>
      <p className={cn('text-lg font-semibold', tokens.title)}>{title}</p>
      {description !== undefined && (
        <p className="text-fg-muted max-w-prose text-sm">{description}</p>
      )}
      {action !== undefined && <div className="mt-2">{action}</div>}
    </div>
  );
}
