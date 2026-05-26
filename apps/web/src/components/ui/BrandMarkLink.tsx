import { Disc3 } from 'lucide-react';
import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from './Icon';

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
      <span className="grid size-7 place-items-center rounded-(--radius-sm) bg-section-tint text-section-accent shadow-xs">
        <Icon as={Disc3} size="sm" />
      </span>
      <span className="text-lg font-bold tracking-normal">Statify</span>
    </Link>
  );
}
