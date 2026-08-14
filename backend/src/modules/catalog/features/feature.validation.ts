import { z } from 'zod';
import { PaginationQuerySchema } from '../../../utils/pagination';

const CATEGORIES = [
  'safety',
  'exterior',
  'interior',
  'comfort',
  'infotainment',
  'convenience',
  'performance',
  'other',
] as const;

export const createFeatureSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    category: z.enum(CATEGORIES),
    description: z.string().max(1000).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updateFeatureSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      category: z.enum(CATEGORIES).optional(),
      description: z.string().max(1000).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const featureQuerySchema = z.object({
  query: PaginationQuerySchema.extend({
    category: z.enum(CATEGORIES).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    search: z.string().optional(),
  }),
});

// VariantFeature
const AVAILABILITIES = ['standard', 'optional', 'unavailable'] as const;

export const createVariantFeatureSchema = z.object({
  body: z.object({
    variantId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid variant ID'),
    featureId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid feature ID'),
    availability: z.enum(AVAILABILITIES),
    value: z.string().max(255).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updateVariantFeatureSchema = z.object({
  body: z
    .object({
      availability: z.enum(AVAILABILITIES).optional(),
      value: z.string().max(255).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const variantFeatureQuerySchema = z.object({
  query: PaginationQuerySchema.extend({
    variantId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    featureId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    availability: z.enum(AVAILABILITIES).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
