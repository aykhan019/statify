'use client';

import type { TrackListResponse, TracksQuery } from '@statify/shared';
import { fetchTracks } from '@/lib/catalog/api';
import { InfiniteScroll } from './InfiniteScroll';
import { TrackRow } from './TrackRow';

interface TracksInfiniteListProps {
  initial: TrackListResponse;
  baseQuery?: Partial<TracksQuery>;
  emptyText?: string;
}

export function TracksInfiniteList({
  initial,
  baseQuery = {},
  emptyText,
}: TracksInfiniteListProps) {
  return (
    <InfiniteScroll
      initial={initial}
      loader={(page) => fetchTracks({ ...baseQuery, page, limit: initial.limit })}
      renderItem={(track) => <TrackRow track={track} />}
      itemKey={(track) => track.id}
      emptyText={emptyText}
    />
  );
}
