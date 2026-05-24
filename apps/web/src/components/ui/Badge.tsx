import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

const badge = cva(
  'inline-flex items-center gap-1 rounded-(--radius-xs) px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] leading-tight',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-sunken text-fg-default border border-border-default',
        section: 'bg-section-accent text-section-accent-fg',
        success: 'bg-state-success-bg text-state-success-fg border border-state-success-border',
        warning: 'bg-state-warning-bg text-state-warning-fg border border-state-warning-border',
        error: 'bg-state-error-bg text-state-error-fg border border-state-error-border',
        info: 'bg-state-info-bg text-state-info-fg border border-state-info-border',
        active: 'bg-state-active-bg text-state-active-fg border border-state-active-border',
        track: 'bg-entity-track text-fg-on-block',
        artist: 'bg-entity-artist text-fg-on-block',
        album: 'bg-entity-album text-fg-on-block',
        playlist: 'bg-entity-playlist text-fg-on-block',
        genre: 'bg-entity-genre text-fg-on-block',
        user: 'bg-entity-user text-fg-on-block',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, ...rest },
  ref,
) {
  return <span ref={ref} className={cn(badge({ variant }), className)} {...rest} />;
});
