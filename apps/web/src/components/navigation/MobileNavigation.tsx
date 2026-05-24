'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Container, Surface } from '@/components/layout';
import { GlobalSearch } from '@/components/catalog';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils/cn';
import { getNavigationItems, isNavigationItemActive } from './items';
import { NavigationLink } from './NavigationLink';

export interface MobileNavigationProps {
  activePath: string;
  className?: string;
  includeAdmin: boolean;
}

export function MobileNavigation({ activePath, className, includeAdmin }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const items = getNavigationItems({ includeAdmin });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-controls={panelId}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        onClick={() => setIsOpen((value) => !value)}
        className={cn(
          'inline-flex size-10 items-center justify-center rounded-(--radius-sm) text-fg-default motion-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page md:hidden',
          isOpen ? 'bg-section-accent text-section-accent-fg' : 'hover:bg-section-row-hover',
          className,
        )}
      >
        <Icon as={isOpen ? X : Menu} size="md" />
      </button>

      {isOpen && (
        <Surface
          id={panelId}
          as="div"
          tone="page"
          border="none"
          radius="none"
          shadow="lg"
          padding="none"
          className="motion-sheet fixed inset-x-0 top-16 z-40 border-b border-border-default md:hidden"
        >
          <Container size="full" gutter="page" className="py-4">
            <div className="mb-4">
              <GlobalSearch />
            </div>
            <nav aria-label="Mobile primary" className="flex flex-col gap-1">
              {items.map((item) => (
                <NavigationLink
                  key={item.href}
                  item={item}
                  active={isNavigationItemActive(activePath, item)}
                  onNavigate={() => setIsOpen(false)}
                  variant="mobile"
                />
              ))}
            </nav>
          </Container>
        </Surface>
      )}
    </>
  );
}
