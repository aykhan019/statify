import type { OffsetPageResult, OffsetPaginationQuery } from '@statify/shared';

export function getOffset(query: OffsetPaginationQuery): number {
  return (query.page - 1) * query.limit;
}

export function toOffsetPage<T>(
  data: T[],
  total: number,
  query: OffsetPaginationQuery,
): OffsetPageResult<T> {
  return {
    data,
    limit: query.limit,
    page: query.page,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}
