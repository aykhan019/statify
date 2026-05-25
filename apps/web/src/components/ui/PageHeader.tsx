import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headingLevel?: 1 | 2 | 3;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  headingLevel = 1,
}: PageHeaderProps) {
  const Heading = headingLevel === 1 ? 'h1' : headingLevel === 2 ? 'h2' : 'h3';

  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <Heading className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</Heading>
        {description !== undefined && (
          <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
        )}
      </div>
      {actions !== undefined && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
