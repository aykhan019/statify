'use client';

import type { ListeningHistoryListResponse } from '@statify/shared';
import { InfiniteScroll } from '@/components/catalog';
import { fetchHistory } from '@/lib/history/api';
import { HistoryRow } from './HistoryRow';

interface HistoryInfiniteListProps {
  initial: ListeningHistoryListResponse;
}

export function HistoryInfiniteList({ initial }: HistoryInfiniteListProps) {
  return (
    <InfiniteScroll
      initial={initial}
      loader={(page) => fetchHistory({ page, limit: initial.limit })}
      renderItem={(item) => <HistoryRow item={item} />}
      itemKey={(item) => item.id}
      emptyText="No listens yet. Play a preview from the catalog to record one."
    />
  );
}
