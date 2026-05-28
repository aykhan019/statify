'use client';

import { X } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

interface ClearInputButtonProps {
  onClick: () => void;
  label?: string;
}

export function ClearInputButton({ onClick, label = 'Clear search' }: ClearInputButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="pointer-events-auto inline-flex h-5 w-5 items-center justify-center rounded-full text-fg-muted motion-colors hover:bg-surface-sunken hover:text-fg-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
    >
      <Icon as={X} size="xs" />
    </button>
  );
}
