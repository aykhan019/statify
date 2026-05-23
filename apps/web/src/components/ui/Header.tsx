import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Container } from './Container';

interface HeaderProps {
  brandHref?: string;
  brandLabel?: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Header({
  brandHref = '/',
  brandLabel = 'Statify',
  nav,
  actions,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'bg-background/80 sticky top-0 z-30 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className,
      )}
    >
      <Container size="xl" className="flex h-14 items-center justify-between gap-4">
        <Link
          href={brandHref}
          className="text-foreground text-base font-semibold tracking-tight hover:opacity-80"
        >
          {brandLabel}
        </Link>
        {nav !== undefined && (
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {nav}
          </nav>
        )}
        {actions !== undefined && <div className="flex items-center gap-2">{actions}</div>}
      </Container>
    </header>
  );
}
