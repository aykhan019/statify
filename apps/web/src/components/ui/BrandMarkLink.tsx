import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { StatifyMark } from './StatifyMark';

interface BrandMarkLinkProps extends Omit<ComponentPropsWithoutRef<typeof Link>, 'href'> {
  href?: string;
}

export function BrandMarkLink({ href = '/', className, ...props }: BrandMarkLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 text-fg-strong hover:text-section-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page',
        className,
      )}
      {...props}
    >
      <StatifyMark className="size-8 shrink-0" />
      <span className="text-2xl font-bold leading-none tracking-tight">Statify</span>
    </Link>
  );
}
