import { z } from 'zod';
import { PaginationQuerySchema } from '../../../utils/pagination';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const PricingSchema = z.object({
  amount: z.number().nonnegative('Pricing amount must be non-negative'),
  currencyCode: z
    .string()
    .trim()
    .length(3, 'Currency code must be exactly 3 characters')
    .toUpperCase(),
  priceType: z.enum(['starting', 'ex_showroom', 'on_road', 'msrp', 'other']),
});

export const CreateVariantMarketSchema = z
  .object({
    variantId: z.string().regex(objectIdRegex, 'Invalid Variant ID format'),
    marketId: z.string().regex(objectIdRegex, 'Invalid Market ID format'),
    availabilityStatus: z
      .enum(['available', 'unavailable', 'upcoming', 'discontinued'])
      .optional()
      .default('upcoming'),
    status: z.enum(['active', 'inactive']).optional().default('active'),
    isFeatured: z.boolean().optional().default(false),
    launchDate: z.string().datetime().optional(),
    discontinuedDate: z.string().datetime().optional(),
    pricing: PricingSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.launchDate && data.discontinuedDate) {
        return new Date(data.discontinuedDate) >= new Date(data.launchDate);
      }
      return true;
    },
    {
      message: 'discontinuedDate cannot be before launchDate',
      path: ['discontinuedDate'],
    },
  );

export const UpdateVariantMarketSchema = z
  .object({
    availabilityStatus: z.enum(['available', 'unavailable', 'upcoming', 'discontinued']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    isFeatured: z.boolean().optional(),
    launchDate: z.string().datetime().optional(),
    discontinuedDate: z.string().datetime().optional(),
    pricing: PricingSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.launchDate && data.discontinuedDate) {
        return new Date(data.discontinuedDate) >= new Date(data.launchDate);
      }
      return true;
    },
    {
      message: 'discontinuedDate cannot be before launchDate',
      path: ['discontinuedDate'],
    },
  );

export const VariantMarketIdParamSchema = z.object({
  id: z.string().regex(objectIdRegex, 'Invalid Variant Market ID format'),
});

export const VariantMarketListQuerySchema = PaginationQuerySchema.extend({
  variantId: z.string().regex(objectIdRegex, 'Invalid Variant ID format').optional(),
  marketId: z.string().regex(objectIdRegex, 'Invalid Market ID format').optional(),
  availabilityStatus: z.enum(['available', 'unavailable', 'upcoming', 'discontinued']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  isFeatured: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  priceType: z.enum(['starting', 'ex_showroom', 'on_road', 'msrp', 'other']).optional(),
});
