import { z } from 'zod';

export const createMarketSchema = z.object({
  body: z.object({
    code: z.string().trim().min(2).max(10),
    name: z.string().trim().min(2).max(100),
    countryCode: z.string().trim().length(2),
    currencyCode: z.string().trim().length(3),
    currencySymbol: z.string().trim().max(5).optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
  }),
});

export const updateMarketSchema = z.object({
  body: z.object({
    code: z.string().trim().min(2).max(10).optional(),
    name: z.string().trim().min(2).max(100).optional(),
    countryCode: z.string().trim().length(2).optional(),
    currencyCode: z.string().trim().length(3).optional(),
    currencySymbol: z.string().trim().max(5).optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid market ID'),
  }),
});

export const getMarketSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid market ID'),
  }),
});

export const getMarketByCodeSchema = z.object({
  params: z.object({
    code: z.string().min(2).max(10),
  }),
});

export const listMarketsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    countryCode: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
