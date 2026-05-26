'use client';

import { Moon, Sun } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import type { ThemeMode } from '@/lib/theme';
import { cn } from '@/lib/utils/cn';
import { useTheme } from './ThemeProvider';

const MODES: Array<{ icon: typeof Sun; label: string; mode: ThemeMode }> = [
  { icon: Sun, label: 'Light mode', mode: 'light' },
  { icon: Moon, label: 'Dark mode', mode: 'dark' },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color mode"
      className={cn(
        'grid h-10 grid-cols-2 rounded-(--radius-sm) border border-border-default bg-surface-sunken p-1 text-fg-muted',
        className,
      )}
    >
      {MODES.map((item) => (
        <button
          key={item.mode}
          type="button"
          aria-label={item.label}
          aria-pressed={mode === item.mode}
          title={item.label}
          onClick={() => setMode(item.mode)}
          className={cn(
            'grid size-8 place-items-center rounded-(--radius-xs) motion-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
            mode === item.mode
              ? 'bg-surface-raised text-fg-strong shadow-xs'
              : 'hover:bg-surface-raised hover:text-fg-default',
          )}
        >
          <Icon as={item.icon} size="sm" />
        </button>
      ))}
    </div>
  );
}
