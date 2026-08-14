import { z } from 'zod';
import { PaginationQuerySchema } from '../../../utils/pagination';

export const GenerationIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format'),
});

export const GenerationSlugParamSchema = z.object({
  slug: z.string().min(1),
});

export const CreateGenerationSchema = z.object({
  body: z
    .object({
      modelId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Model ObjectId format'),
      generationCode: z.string().min(1).trim(),
      name: z.string().min(1).trim(),
      slug: z.string().trim().toLowerCase().optional(),
      generationNumber: z.number().int().min(1).optional(),
      startYear: z.number().int().min(1800).max(2100).optional(),
      endYear: z.number().int().min(1800).max(2100).optional(),
      description: z.string().optional(),
      status: z.enum(['active', 'inactive', 'draft']).optional(),
    })
    .refine(
      (data) => {
        if (data.startYear && data.endYear) {
          return data.endYear >= data.startYear;
        }
        return true;
      },
      {
        message: 'endYear must be greater than or equal to startYear',
        path: ['endYear'],
      },
    ),
});

export const UpdateGenerationSchema = z.object({
  params: GenerationIdParamSchema,
  body: z
    .object({
      modelId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Model ObjectId format')
        .optional(),
      generationCode: z.string().min(1).trim().optional(),
      name: z.string().min(1).trim().optional(),
      slug: z.string().trim().toLowerCase().optional(),
      generationNumber: z.number().int().min(1).optional(),
      startYear: z.number().int().min(1800).max(2100).optional(),
      endYear: z.number().int().min(1800).max(2100).optional(),
      description: z.string().optional(),
      status: z.enum(['active', 'inactive', 'draft']).optional(),
    })
    .refine(
      (data) => {
        if (data.startYear && data.endYear) {
          return data.endYear >= data.startYear;
        }
        return true;
      },
      {
        message: 'endYear must be greater than or equal to startYear',
        path: ['endYear'],
      },
    ),
});

export const GenerationListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(['active', 'inactive', 'draft']).optional(),
  modelId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Model ObjectId format')
    .optional(),
});
