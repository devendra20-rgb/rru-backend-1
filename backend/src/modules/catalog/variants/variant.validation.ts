import { z } from 'zod';
import { PaginationQuerySchema } from '../../../utils/pagination';

export const CreateVariantSchema = z.object({
  body: z.object({
    modelId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
    generationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional().nullable().or(z.literal('')),
    variantCode: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    slug: z.string().optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    modelYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 2)
      .optional(),
    fuelType: z
      .enum(['petrol', 'diesel', 'hybrid', 'plug_in_hybrid', 'electric', 'cng', 'lpg', 'other'])
      .optional(),
    transmissionType: z.enum(['manual', 'automatic', 'cvt', 'dct', 'amt', 'other']).optional(),
    drivetrain: z.enum(['fwd', 'rwd', 'awd', '4wd', 'other']).optional(),
    engine: z
      .object({
        displacementCc: z.number().positive().optional(),
        cylinders: z.number().int().positive().optional(),
        aspiration: z.string().optional(),
        powerHp: z.number().positive().optional(),
        torqueNm: z.number().positive().optional(),
      })
      .optional(),
    seatingCapacity: z.number().int().positive().optional(),
    doors: z.number().int().positive().optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
  }),
});

export const UpdateVariantSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
  }),
  body: z.object({
    modelId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional(),
    generationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId').optional().nullable().or(z.literal('')),
    variantCode: z.string().optional(),
    name: z.string().min(1).optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    modelYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 2)
      .optional(),
    fuelType: z
      .enum(['petrol', 'diesel', 'hybrid', 'plug_in_hybrid', 'electric', 'cng', 'lpg', 'other'])
      .optional(),
    transmissionType: z.enum(['manual', 'automatic', 'cvt', 'dct', 'amt', 'other']).optional(),
    drivetrain: z.enum(['fwd', 'rwd', 'awd', '4wd', 'other']).optional(),
    engine: z
      .object({
        displacementCc: z.number().positive().optional(),
        cylinders: z.number().int().positive().optional(),
        aspiration: z.string().optional(),
        powerHp: z.number().positive().optional(),
        torqueNm: z.number().positive().optional(),
      })
      .optional(),
    seatingCapacity: z.number().int().positive().optional(),
    doors: z.number().int().positive().optional(),
    status: z.enum(['active', 'inactive', 'draft']).optional(),
  }),
});

export const VariantIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'),
});

export const VariantSlugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export const VariantListQuerySchema = PaginationQuerySchema.extend({
  generationId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')
    .optional(),
  modelId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')
    .optional(),
  brandId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId')
    .optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  fuelType: z
    .enum(['petrol', 'diesel', 'hybrid', 'plug_in_hybrid', 'electric', 'cng', 'lpg', 'other'])
    .optional(),
  transmissionType: z.enum(['manual', 'automatic', 'cvt', 'dct', 'amt', 'other']).optional(),
  drivetrain: z.enum(['fwd', 'rwd', 'awd', '4wd', 'other']).optional(),
  modelYear: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().optional()),
});
