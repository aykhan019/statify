import { cn } from '@/lib/utils/cn';
import { Container, type ContainerGutter, type ContainerSize } from './Container';
import { getLayoutElement, type LayoutPrimitiveProps } from './types';

export type SectionTone = 'plain' | 'tint' | 'block' | 'sunken';
export type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';

const sectionTone: Record<SectionTone, string> = {
  plain: 'bg-transparent text-fg-default',
  tint: 'bg-section-tint text-fg-default',
  block: 'bg-section-block text-section-block-fg',
  sunken: 'bg-surface-sunken text-fg-default',
};

const sectionSpacing: Record<SectionSpacing, string> = {
  none: 'py-0',
  sm: 'py-6',
  md: 'py-8',
  lg: 'py-10 lg:py-12',
  xl: 'py-12 lg:py-16',
};

export interface SectionProps extends LayoutPrimitiveProps {
  tone?: SectionTone;
  spacing?: SectionSpacing;
  container?: ContainerSize | 'none';
  gutter?: ContainerGutter;
}

export function Section({
  as,
  tone = 'plain',
  spacing = 'md',
  container = 'wide',
  gutter = 'page',
  className,
  children,
  ...props
}: SectionProps) {
  const Component = getLayoutElement(as, 'section');

  return (
    <Component className={cn(sectionTone[tone], sectionSpacing[spacing], className)} {...props}>
      {container === 'none' ? (
        children
      ) : (
        <Container size={container} gutter={gutter}>
          {children}
        </Container>
      )}
    </Component>
  );
}
