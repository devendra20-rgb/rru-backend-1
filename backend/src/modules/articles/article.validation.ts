import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255),
    slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and dashes').optional(),
    excerpt: z.string().max(500).optional(),
    content: z.string().min(10),
    featuredImage: objectIdSchema.optional(),
    category: z.string().min(2).max(100),
    authorId: objectIdSchema,
    status: z.enum(['published', 'draft', 'archived']).default('draft'),
    publishedAt: z.string().datetime().optional(),
  }),
});

export const updateArticleSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/).optional(),
    excerpt: z.string().max(500).optional(),
    content: z.string().min(10).optional(),
    featuredImage: objectIdSchema.optional(),
    category: z.string().min(2).max(100).optional(),
    status: z.enum(['published', 'draft', 'archived']).optional(),
    publishedAt: z.string().datetime().optional(),
  }),
});

export const getArticlesQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(['published', 'draft', 'archived']).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getArticleBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

export const getArticleSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteArticleSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
