import { z } from 'zod';
import { PaginationQuerySchema } from '../../../utils/pagination';

export const ModelIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
});

export const ModelSlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const CreateModelSchema = z.object({
  body: z.object({
    brandId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Brand ObjectId format'),
    modelCode: z.string().min(1).trim(),
    name: z.string().min(1).trim(),
    slug: z.string().trim().toLowerCase().optional(),
    bodyType: z.string().optional(),
    segment: z.string().optional(),
    launchYear: z.number().int().min(1800).max(2100).optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
  }),
});

export const UpdateModelSchema = z.object({
  params: ModelIdParamSchema,
  body: z.object({
    brandId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Brand ObjectId format')
      .optional(),
    modelCode: z.string().min(1).trim().optional(),
    name: z.string().min(1).trim().optional(),
    slug: z.string().trim().toLowerCase().optional(),
    bodyType: z.string().optional(),
    segment: z.string().optional(),
    launchYear: z.number().int().min(1800).max(2100).optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
      })
      .optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
  }),
});

export const ModelListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(['active', 'inactive', 'draft']).optional(),
  brandId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Brand ObjectId format')
    .optional(),
  bodyType: z.string().optional(),
  segment: z.string().optional(),
});
