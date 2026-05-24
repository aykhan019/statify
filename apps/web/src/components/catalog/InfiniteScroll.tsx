'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { EmptyState } from '@/components/states';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface PageResult<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

interface InfiniteScrollProps<T> {
  initial: PageResult<T>;
  loader: (page: number) => Promise<PageResult<T>>;
  renderItem: (item: T) => ReactNode;
  itemKey: (item: T) => string | number;
  emptyText?: string;
  emptyState?: ReactNode;
  listClassName?: string;
}

export function InfiniteScroll<T>({
  initial,
  loader,
  renderItem,
  itemKey,
  emptyText = 'Nothing here yet',
  emptyState,
  listClassName,
}: InfiniteScrollProps<T>) {
  const [items, setItems] = useState<T[]>(initial.data);
  const [page, setPage] = useState(initial.page);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  const loadNext = useCallback(async () => {
    if (isLoadingRef.current || page >= totalPages) {
      return;
    }
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const next = await loader(page + 1);
      setItems((current) => [...current, ...next.data]);
      setPage(next.page);
      setTotalPages(next.totalPages);
    } catch {
      setError('Could not load more results.');
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [loader, page, totalPages]);

  useEffect(() => {
    const node = sentinelRef.current;

    if (node === null || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNext();
        }
      },
      { rootMargin: '300px 0px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [loadNext]);

  if (items.length === 0) {
    return emptyState ?? <EmptyState title={emptyText} />;
  }

  const hasMore = page < totalPages;

  return (
    <div className="flex flex-col gap-3">
      <ul className={cn('flex flex-col gap-3', listClassName)}>
        {items.map((item) => (
          <li key={itemKey(item)}>{renderItem(item)}</li>
        ))}
      </ul>

      <div ref={sentinelRef} aria-hidden="true" />

      {error !== null && (
        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-state-error-fg text-sm">{error}</p>
          <Button type="button" variant="secondary" size="sm" onClick={() => void loadNext()}>
            Retry
          </Button>
        </div>
      )}

      {error === null && hasMore && (
        <div className="flex justify-center py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void loadNext()}
            disabled={isLoading}
          >
            {isLoading ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}

      {!hasMore && <p className="text-fg-muted text-center text-xs">All {items.length} results.</p>}
    </div>
  );
}
