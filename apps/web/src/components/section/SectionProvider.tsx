'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { resolveSection } from './section';

export interface SectionProviderProps {
  children: ReactNode;
  className?: string;
  pathname?: string;
}

export function SectionProvider({ children, className, pathname }: SectionProviderProps) {
  const routePathname = usePathname();
  const section = resolveSection(pathname ?? routePathname);

  return (
    <div
      data-section={section.id}
      data-section-hue={section.hue}
      data-section-neutral={section.neutral ? '' : undefined}
      className={cn(className)}
    >
      {children}
    </div>
  );
}
