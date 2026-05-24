import type { ReactNode } from 'react';
import { Container } from '@/components/layout';
import { Icon, type IconProps } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';

export interface SectionBlockHeaderProps {
  actions?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: IconProps['as'];
  title: ReactNode;
}

export function SectionBlockHeader({
  actions,
  className,
  description,
  eyebrow,
  icon,
  title,
}: SectionBlockHeaderProps) {
  return (
    <header data-section-block className={cn('bg-section-block text-section-block-fg', className)}>
      <Container size="wide" gutter="page" className="py-12 lg:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-(--container-prose)">
            {eyebrow !== undefined && (
              <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.04em] opacity-80">
                {eyebrow}
              </p>
            )}
            <div className="flex min-w-0 items-start gap-4">
              {icon !== undefined && (
                <span className="grid size-12 shrink-0 place-items-center rounded-(--radius-md) border border-section-block-fg/35 text-section-block-fg">
                  <Icon as={icon} size="lg" />
                </span>
              )}
              <div className="min-w-0">
                <h1 className="text-5xl leading-[0.95] font-extrabold tracking-normal break-words text-balance">
                  {title}
                </h1>
                {description !== undefined && (
                  <p className="mt-5 max-w-(--container-narrow) text-base leading-relaxed opacity-85 sm:text-lg">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
          {actions !== undefined && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      </Container>
    </header>
  );
}
