import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Base shimmer block. Token-bound: `--surface-sunken` fill, `--radius-sm`,
 * and `--animate-skeleton-pulse`.
 * Decorative: marked `aria-hidden`; the surrounding loading boundary owns the
 * busy semantics.
 */
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('bg-surface-sunken motion-skeleton rounded-(--radius-sm)', className)}
      {...rest}
    />
  );
}

function HeaderSkeleton() {
  return (
    <div className="border-border-default flex flex-col gap-3 border-b pb-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

/**
 * Row-list placeholder (tracks, history, audit log, user tables): a cover
 * square plus two text lines per row.
 */
export function ListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <section aria-hidden="true" className="flex flex-col gap-6">
      <HeaderSkeleton />
      <ul className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <li
            key={index}
            className="border-border-default flex items-center gap-4 rounded-(--radius-md) border p-3"
          >
            <Skeleton className="size-12 rounded-(--radius-sm)" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/5" />
            </div>
            <Skeleton className="h-4 w-10" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Card-grid placeholder (artists, albums, playlists): square cover plus a
 * title and subtitle line per card.
 */
export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <section aria-hidden="true" className="flex flex-col gap-6">
      <HeaderSkeleton />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <Skeleton className="aspect-square w-full rounded-(--radius-md)" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Detail-page placeholder: hero cover + eyebrow / title / meta stack, then a
 * two-column content band.
 */
export function DetailSkeleton() {
  return (
    <section aria-hidden="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Skeleton className="size-40 rounded-(--radius-lg)" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 rounded-(--radius-md)" />
        <Skeleton className="h-40 rounded-(--radius-md)" />
      </div>
    </section>
  );
}

/**
 * Analytics placeholder: header, a chart canvas band, and a row of summary
 * tiles.
 */
export function ChartSkeleton({ tiles = 4 }: { tiles?: number }) {
  return (
    <section aria-hidden="true" className="flex flex-col gap-6">
      <HeaderSkeleton />
      <Skeleton className="h-72 w-full rounded-(--radius-md)" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: tiles }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-(--radius-md)" />
        ))}
      </div>
    </section>
  );
}
