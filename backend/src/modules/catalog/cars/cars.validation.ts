import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid ObjectId format' });

export const getCarsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().trim().optional(),
    brandId: objectIdSchema.optional(),
    modelId: objectIdSchema.optional(),
    generationId: objectIdSchema.optional(),
    marketId: objectIdSchema.optional(),
    fuelType: z.string().trim().optional(),
    transmissionType: z.string().trim().optional(),
    drivetrain: z.string().trim().optional(),
    modelYear: z.coerce.number().int().optional(),
    availabilityStatus: z.string().trim().optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
    sortBy: z.enum(['price', 'createdAt', 'modelYear', 'name']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export const getCarDetailSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});
