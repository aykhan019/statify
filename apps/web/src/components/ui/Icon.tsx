import type { ComponentPropsWithoutRef, ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/utils/cn';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

type LucideLike = ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  }
>;

export interface IconProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'children'> {
  as: LucideLike;
  size?: IconSize;
}

/**
 * Lucide icon wrapper. Locks strokeWidth at 2 per DESIGN.md §8.2 and
 * exposes a size prop bound to the token scale in DESIGN.md §8.3.
 */
export function Icon({ as: Component, size = 'md', className, ...rest }: IconProps) {
  const px = SIZE_PX[size];
  return (
    <Component
      width={px}
      height={px}
      strokeWidth={2}
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
      {...rest}
    />
  );
}
