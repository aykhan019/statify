import { cn } from '@/lib/utils/cn';
import { getLayoutElement, type LayoutPrimitiveProps } from './types';

export type SurfaceTone = 'page' | 'work' | 'raised' | 'sunken' | 'overlay' | 'section';
export type SurfaceBorder = 'none' | 'default' | 'strong' | 'section';
export type SurfaceRadius = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type SurfaceShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

const surfaceTone: Record<SurfaceTone, string> = {
  page: 'bg-surface-page text-fg-default',
  work: 'bg-surface-work text-fg-default',
  raised: 'bg-surface-raised text-fg-default',
  sunken: 'bg-surface-sunken text-fg-default',
  overlay: 'bg-surface-overlay text-fg-on-block',
  section: 'bg-section-block text-section-block-fg',
};

const surfaceBorder: Record<SurfaceBorder, string> = {
  none: 'border-0',
  default: 'border border-border-default',
  strong: 'border border-border-strong',
  section: 'border border-section-accent',
};

const surfaceRadius: Record<SurfaceRadius, string> = {
  none: 'rounded-none',
  xs: 'rounded-(--radius-xs)',
  sm: 'rounded-(--radius-sm)',
  md: 'rounded-(--radius-md)',
  lg: 'rounded-(--radius-lg)',
  xl: 'rounded-(--radius-xl)',
  '2xl': 'rounded-(--radius-2xl)',
  full: 'rounded-(--radius-full)',
};

const surfaceShadow: Record<SurfaceShadow, string> = {
  none: 'shadow-none',
  xs: 'shadow-xs',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

const surfacePadding: Record<SurfacePadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export interface SurfaceProps extends LayoutPrimitiveProps {
  tone?: SurfaceTone;
  border?: SurfaceBorder;
  radius?: SurfaceRadius;
  shadow?: SurfaceShadow;
  padding?: SurfacePadding;
}

export function Surface({
  as,
  tone = 'raised',
  border = 'default',
  radius = 'md',
  shadow = 'none',
  padding = 'md',
  className,
  ...props
}: SurfaceProps) {
  const Component = getLayoutElement(as, 'div');

  return (
    <Component
      className={cn(
        surfaceTone[tone],
        surfaceBorder[border],
        surfaceRadius[radius],
        surfaceShadow[shadow],
        surfacePadding[padding],
        className,
      )}
      {...props}
    />
  );
}
