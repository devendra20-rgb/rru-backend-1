import { z } from 'zod';
import { Types } from 'mongoose';
import { PaginationQuerySchema } from '../../utils/pagination';

export const createMediaSchema = z.object({
  body: z.object({
    folder: z.string().optional(),
    entityType: z.enum(['variant', 'brand', 'model', 'generation']).optional(),
    entityId: z.string().refine((val) => Types.ObjectId.isValid(val), {
      message: 'Invalid entityId',
    }).optional(),
    mediaType: z.enum(['image', 'video']).optional().default('image'),
    altText: z.string().optional(),
    isPrimary: z
      .union([z.boolean(), z.string().transform((val) => val === 'true')])
      .optional()
      .default(false),
    sortOrder: z
      .union([z.number(), z.string().transform((val) => parseInt(val, 10))])
      .optional()
      .default(0),
  }),
});

export const updateMediaSchema = z.object({
  body: z.object({
    altText: z.string().optional(),
    isPrimary: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional(),
    sortOrder: z.union([z.number(), z.string().transform((val) => parseInt(val, 10))]).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const mediaQuerySchema = z.object({
  query: PaginationQuerySchema.extend({
    entityType: z.enum(['variant']).optional(),
    entityId: z
      .string()
      .refine((val) => Types.ObjectId.isValid(val), {
        message: 'Invalid entityId',
      })
      .optional(),
    mediaType: z.enum(['image', 'video']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    isPrimary: z.union([z.boolean(), z.string().transform((val) => val === 'true')]).optional(),
  }),
});
