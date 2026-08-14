import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default('1' as any),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .default('20' as any),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const getPaginationOptions = (query: PaginationQuery) => {
  const page = Math.max(1, query.page);
  const limit = Math.min(100, Math.max(1, query.limit)); // Max 100 limit
  const skip = (page - 1) * limit;
  const sort: Record<string, 1 | -1> = { [query.sortBy]: query.sortOrder === 'desc' ? -1 : 1 };

  return { page, limit, skip, sort };
};

export const getPaginationMeta = (total: number, page: number, limit: number) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
