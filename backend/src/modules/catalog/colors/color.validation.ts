import { z } from 'zod';
import { PaginationQuerySchema } from '../../../utils/pagination';

const COLOR_TYPES = ['exterior', 'interior'] as const;
const AVAILABILITIES = ['standard', 'optional', 'unavailable'] as const;

// Hex code regex: optional leading # then 3 or 6 hex digits
const hexCodeRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createColorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    hexCode: z
      .string()
      .regex(hexCodeRegex, 'hexCode must be a valid hex color (e.g. #FF0000 or #F00)')
      .optional(),
    type: z.enum(COLOR_TYPES),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updateColorSchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(100).optional(),
      hexCode: z
        .string()
        .regex(hexCodeRegex, 'hexCode must be a valid hex color (e.g. #FF0000 or #F00)')
        .optional(),
      type: z.enum(COLOR_TYPES).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const colorQuerySchema = z.object({
  query: PaginationQuerySchema.extend({
    type: z.enum(COLOR_TYPES).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    search: z.string().optional(),
  }),
});

// VariantColor
export const createVariantColorSchema = z.object({
  body: z.object({
    variantId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid variant ID'),
    colorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid color ID'),
    availability: z.enum(AVAILABILITIES),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updateVariantColorSchema = z.object({
  body: z
    .object({
      availability: z.enum(AVAILABILITIES).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const variantColorQuerySchema = z.object({
  query: PaginationQuerySchema.extend({
    variantId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    colorId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
    availability: z.enum(AVAILABILITIES).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
