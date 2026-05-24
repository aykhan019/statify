import type { ElementType, HTMLAttributes } from 'react';

export type LayoutElement =
  | 'article'
  | 'aside'
  | 'div'
  | 'footer'
  | 'header'
  | 'main'
  | 'nav'
  | 'section';

export interface LayoutPrimitiveProps extends HTMLAttributes<HTMLElement> {
  as?: LayoutElement;
}

export function getLayoutElement(
  as: LayoutElement | undefined,
  fallback: LayoutElement,
): ElementType {
  return as ?? fallback;
}
