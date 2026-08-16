import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createReviewSchema = z.object({
  body: z.object({
    variantId: z.string().regex(objectIdRegex, 'Invalid variant ID format'),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(200).optional(),
    body: z.string().max(2000).optional(),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid review ID format'),
  }),
  body: z
    .object({
      rating: z.number().int().min(1).max(5).optional(),
      title: z.string().max(200).optional(),
      body: z.string().max(2000).optional(),
      status: z.enum(['approved', 'pending', 'rejected', 'inactive']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const getReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid review ID format'),
  }),
});

export const deleteReviewSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid review ID format'),
  }),
});

export const getVariantReviewsSchema = z.object({
  params: z.object({
    variantId: z.string().regex(objectIdRegex, 'Invalid variant ID format'),
  }),
});
