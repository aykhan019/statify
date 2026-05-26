'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';
import type { NavigationItem } from './items';

export type NavigationLinkVariant = 'side' | 'top' | 'mobile';
export type NavigationLinkDemoState = 'default' | 'hover' | 'focus' | 'active' | 'disabled';
type ResolvedNavigationState = NavigationLinkDemoState;

const variantClassName: Record<NavigationLinkVariant, string> = {
  side: 'w-full px-3 py-2',
  top: 'px-3 py-2',
  mobile: 'w-full px-4 py-3',
};

const stateClassName: Record<ResolvedNavigationState, string> = {
  active: 'bg-section-accent text-section-accent-fg',
  default: 'text-fg-muted hover:bg-section-row-hover hover:text-fg-strong',
  disabled: 'pointer-events-none text-fg-faint opacity-50',
  focus: 'text-fg-default ring-2 ring-ring-focus ring-offset-2 ring-offset-surface-page',
  hover: 'bg-section-row-hover text-fg-strong',
};

export interface NavigationLinkProps {
  item: NavigationItem;
  active?: boolean;
  className?: string;
  disabled?: boolean;
  onNavigate?: () => void;
  state?: NavigationLinkDemoState;
  variant?: NavigationLinkVariant;
}

export function NavigationLink({
  item,
  active = false,
  className,
  disabled = false,
  onNavigate,
  state,
  variant = 'side',
}: NavigationLinkProps) {
  const resolvedState = getResolvedState({ active, disabled, state });
  const isActive = resolvedState === 'active';
  const isDisabled = resolvedState === 'disabled';

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      aria-disabled={isDisabled ? true : undefined}
      tabIndex={isDisabled ? -1 : undefined}
      onClick={(event) => {
        if (isDisabled) {
          event.preventDefault();
          return;
        }

        onNavigate?.();
      }}
      className={cn(
        'group inline-flex min-w-0 items-center gap-3 rounded-(--radius-sm) text-sm font-medium motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page',
        variantClassName[variant],
        stateClassName[resolvedState],
        className,
      )}
    >
      <Icon as={item.icon} size="md" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function getResolvedState({
  active,
  disabled,
  state,
}: {
  active: boolean;
  disabled: boolean;
  state: NavigationLinkDemoState | undefined;
}): ResolvedNavigationState {
  if (state !== undefined) {
    return state;
  }

  if (disabled) {
    return 'disabled';
  }

  return active ? 'active' : 'default';
}
