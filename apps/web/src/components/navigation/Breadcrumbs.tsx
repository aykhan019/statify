'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getBreadcrumbItems } from './items';

export interface BreadcrumbsProps {
  activePath?: string;
  className?: string;
}

export function Breadcrumbs({ activePath, className }: BreadcrumbsProps) {
  const pathname = usePathname();
  const items = getBreadcrumbItems(activePath ?? pathname);

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-6', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {items.map((item, index) => (
          <li key={item.href} className="flex min-w-0 items-center gap-1">
            {index > 0 && <Icon as={ChevronRight} size="xs" className="text-fg-faint" />}
            {item.current ? (
              <span aria-current="page" className="truncate font-medium text-fg-strong">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="truncate rounded-(--radius-xs) px-1 text-fg-muted motion-colors hover:bg-section-row-hover hover:text-fg-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
