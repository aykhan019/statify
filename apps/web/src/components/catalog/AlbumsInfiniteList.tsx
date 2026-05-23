'use client';

import type { AlbumListResponse, AlbumsQuery } from '@statify/shared';
import { fetchAlbums } from '@/lib/catalog/api';
import { AlbumCard } from './AlbumCard';
import { InfiniteScroll } from './InfiniteScroll';

interface AlbumsInfiniteListProps {
  initial: AlbumListResponse;
  baseQuery?: Partial<AlbumsQuery>;
  emptyText?: string;
}

export function AlbumsInfiniteList({
  initial,
  baseQuery = {},
  emptyText,
}: AlbumsInfiniteListProps) {
  return (
    <InfiniteScroll
      initial={initial}
      loader={(page) => fetchAlbums({ ...baseQuery, page, limit: initial.limit })}
      renderItem={(album) => <AlbumCard album={album} />}
      itemKey={(album) => album.id}
      emptyText={emptyText}
    />
  );
}
