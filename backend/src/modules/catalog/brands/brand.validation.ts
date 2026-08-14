import { z } from 'zod';
import { PaginationQuerySchema } from '../../../utils/pagination';

export const BrandIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
});

export const BrandSlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const CreateBrandSchema = z.object({
  body: z.object({
    brandCode: z.string().min(1).trim(),
    name: z.string().min(1).trim(),
    slug: z.string().trim().toLowerCase().optional(),
    originCountryCode: z.string().length(2).optional(),
    websiteUrl: z.string().url().optional(),
    logoMediaId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')
      .optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const UpdateBrandSchema = z.object({
  params: BrandIdParamSchema,
  body: z.object({
    brandCode: z.string().min(1).trim().optional(),
    name: z.string().min(1).trim().optional(),
    slug: z.string().trim().toLowerCase().optional(),
    originCountryCode: z.string().length(2).optional(),
    websiteUrl: z.string().url().optional(),
    logoMediaId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')
      .optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const BrandListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(['active', 'inactive']).optional(),
});
