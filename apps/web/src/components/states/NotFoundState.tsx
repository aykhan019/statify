import { SearchX } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/Button';
import type { IconProps } from '@/components/ui/Icon';
import { StatePanel } from './StatePanel';

interface NotFoundStateProps {
  title?: string;
  description?: ReactNode;
  homeHref?: string;
  homeLabel?: string;
  icon?: IconProps['as'];
  className?: string;
}

/**
 * Missing-entity state. Neutral tone with a link back to a known-good route.
 * Rendered by `not-found.tsx` boundaries and after `notFound()` is called from
 * a detail route.
 */
export function NotFoundState({
  title = 'Not found',
  description = "We couldn't find that. It may have been removed, or the link is out of date.",
  homeHref = '/me',
  homeLabel = 'Back to dashboard',
  icon = SearchX,
  className,
}: NotFoundStateProps) {
  return (
    <StatePanel
      tone="neutral"
      role="status"
      icon={icon}
      title={title}
      description={description}
      className={className}
      action={
        <Link href={homeHref} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
          {homeLabel}
        </Link>
      }
    />
  );
}
