'use client';

import type { ArtistListResponse, ArtistsQuery } from '@statify/shared';
import { fetchArtists } from '@/lib/catalog/api';
import { ArtistCard } from './ArtistCard';
import { InfiniteScroll } from './InfiniteScroll';

interface ArtistsInfiniteListProps {
  initial: ArtistListResponse;
  baseQuery?: Partial<ArtistsQuery>;
  emptyText?: string;
}

export function ArtistsInfiniteList({
  initial,
  baseQuery = {},
  emptyText,
}: ArtistsInfiniteListProps) {
  return (
    <div className="flex flex-col gap-3">
      <InfiniteScroll
        initial={initial}
        loader={(page) => fetchArtists({ ...baseQuery, page, limit: initial.limit })}
        renderItem={(artist) => <ArtistCard artist={artist} />}
        itemKey={(artist) => artist.id}
        emptyText={emptyText}
        listClassName="grid sm:grid-cols-2 xl:grid-cols-3"
      />
    </div>
  );
}
