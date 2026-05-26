import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { BrandMarkLink } from './BrandMarkLink';
import { Container } from './Container';

interface HeaderProps {
  brandHref?: string;
  brandLabel?: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Header({ brandHref = '/', brandLabel, nav, actions, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full border-b border-border-default bg-surface-page/85 text-fg-default backdrop-blur supports-[backdrop-filter]:bg-surface-page/75',
        className,
      )}
    >
      <Container size="xl" className="flex h-14 items-center justify-between gap-4">
        {brandLabel ?? <BrandMarkLink href={brandHref} />}
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
