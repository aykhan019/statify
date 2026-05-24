import type { ReactNode } from 'react';
import { Container, type ContainerSize } from '@/components/layout';
import { cn } from '@/lib/utils/cn';

export interface SectionContentProps {
  children: ReactNode;
  className?: string;
  size?: ContainerSize;
}

export function SectionContent({ children, className, size = 'wide' }: SectionContentProps) {
  return (
    <Container size={size} gutter="page" className={cn('py-6 sm:py-8 lg:py-10', className)}>
      {children}
    </Container>
  );
}
