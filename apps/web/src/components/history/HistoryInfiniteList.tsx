'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ListeningHistoryListItem, ListeningHistoryListResponse } from '@statify/shared';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/states';
import { fetchHistory } from '@/lib/history/api';
import { HistoryRow } from './HistoryRow';

interface HistoryInfiniteListProps {
  initial: ListeningHistoryListResponse;
}

interface DedupedEntry {
  item: ListeningHistoryListItem;
  count: number;
}

function dedupeByTrack(items: readonly ListeningHistoryListItem[]): DedupedEntry[] {
  const order: number[] = [];
  const byTrack = new Map<number, DedupedEntry>();
  for (const item of items) {
    const existing = byTrack.get(item.track.id);
    if (existing === undefined) {
      byTrack.set(item.track.id, { item, count: 1 });
      order.push(item.track.id);
    } else {
      existing.count += 1;
      const prevAt = Date.parse(existing.item.playedAt);
      const currAt = Date.parse(item.playedAt);
      if (Number.isFinite(currAt) && (!Number.isFinite(prevAt) || currAt > prevAt)) {
        existing.item = item;
      }
    }
  }
  return order.map((id) => byTrack.get(id)!);
}

export function HistoryInfiniteList({ initial }: HistoryInfiniteListProps) {
  const [items, setItems] = useState<ListeningHistoryListItem[]>(initial.data);
  const [page, setPage] = useState(initial.page);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initial.page < initial.totalPages);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  const loadNext = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const next = await fetchHistory({ page: page + 1, limit: initial.limit });
      setItems((current) => [...current, ...next.data]);
      setPage(next.page);
      setHasMore(next.page < next.totalPages);
    } catch {
      // Reached the end (or transient error) — stop pagination silently.
      setHasMore(false);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasMore, initial.limit, page]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (node === null || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadNext();
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadNext]);

  if (items.length === 0) {
    return <EmptyState title="No listens yet. Play a preview from the catalog to record one." />;
  }

  const deduped = dedupeByTrack(items);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {deduped.map((entry, index) => (
          <li key={entry.item.track.id}>
            <HistoryRow item={entry.item} index={index} playCount={entry.count} />
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} aria-hidden="true" />

      {hasMore && (
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

      {!hasMore && (
        <p className="text-fg-muted text-center text-xs">
          {deduped.length} unique tracks · {items.length} plays loaded
        </p>
      )}
    </div>
  );
}
