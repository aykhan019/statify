import { z } from 'zod';

export const PAGE_SIZE_DEFAULT = 20;
export const PAGE_SIZE_MAX = 100;

export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(PAGE_SIZE_MAX).default(PAGE_SIZE_DEFAULT),
});

export const OffsetPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGE_SIZE_MAX).default(PAGE_SIZE_DEFAULT),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type OffsetPaginationQuery = z.infer<typeof OffsetPaginationQuerySchema>;

export interface PageResult<T> {
  data: T[];
  nextCursor: string | null;
  total?: number;
}

export interface OffsetPageResult<T> {
  data: T[];
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}
