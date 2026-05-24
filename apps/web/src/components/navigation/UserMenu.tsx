'use client';

import type { AuthUser } from '@statify/shared';
import { ChevronDown, LogOut, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type ComponentProps } from 'react';
import { Surface } from '@/components/layout';
import { Icon } from '@/components/ui/Icon';
import { logoutUser } from '@/lib/auth/api';
import { cn } from '@/lib/utils/cn';

export interface UserMenuProps {
  includeAdmin: boolean;
  user: AuthUser;
}

export function UserMenu({ includeAdmin, user }: UserMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const close = () => {
    if (detailsRef.current !== null) {
      detailsRef.current.open = false;
    }
  };

  const onLogout = async () => {
    setIsPending(true);

    try {
      await logoutUser();
    } finally {
      router.replace('/login');
      router.refresh();
    }
  };

  return (
    <details ref={detailsRef} className="relative">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-(--radius-sm) px-3 text-sm font-medium text-fg-default motion-colors hover:bg-section-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page [&::-webkit-details-marker]:hidden">
        <Icon as={User} size="md" />
        <span className="hidden max-w-48 truncate lg:block">{user.displayName}</span>
        <Icon as={ChevronDown} size="sm" className="text-fg-muted" />
      </summary>
      <Surface
        tone="raised"
        border="default"
        radius="md"
        shadow="md"
        padding="sm"
        className="motion-panel absolute right-0 z-50 mt-2 w-48"
      >
        <div className="border-b border-border-default px-2 pb-2">
          <p className="truncate text-sm font-semibold text-fg-strong">{user.displayName}</p>
          <p className="truncate text-xs text-fg-muted">{user.email}</p>
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <MenuLink href="/me/account" icon={User} label="Account" onClick={close} />
          {includeAdmin && <MenuLink href="/admin" icon={Shield} label="Admin" onClick={close} />}
          <button
            type="button"
            onClick={onLogout}
            disabled={isPending}
            className={cn(
              'flex w-full items-center gap-2 rounded-(--radius-sm) px-2 py-2 text-left text-sm font-medium text-fg-muted motion-interactive hover:bg-section-row-hover hover:text-fg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus disabled:pointer-events-none disabled:text-fg-faint disabled:opacity-50',
            )}
          >
            <Icon as={LogOut} size="md" />
            {isPending ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </Surface>
    </details>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: ComponentProps<typeof Icon>['as'];
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-(--radius-sm) px-2 py-2 text-sm font-medium text-fg-muted motion-interactive hover:bg-section-row-hover hover:text-fg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
    >
      <Icon as={icon} size="md" />
      {label}
    </Link>
  );
}
