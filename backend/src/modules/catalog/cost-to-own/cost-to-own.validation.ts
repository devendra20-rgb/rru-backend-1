import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createCostToOwnSchema = z.object({
  body: z.object({
    variantId: z.string().regex(objectIdRegex, 'Invalid variant ID format'),
    marketId: z.string().regex(objectIdRegex, 'Invalid market ID format'),
    fuelCostAssumptions: z.number().min(0).optional(),
    insurance: z.number().min(0).optional(),
    registration: z.number().min(0).optional(),
    maintenance: z.number().min(0).optional(),
    service: z.number().min(0).optional(),
    depreciation: z.number().min(0).optional(),
    otherOwnershipCosts: z.number().min(0).optional(),
    ownershipPeriod: z.number().min(1).optional(),
    totalEstimatedCost: z.number().min(0).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const updateCostToOwnSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid CostToOwn ID format'),
  }),
  body: z
    .object({
      variantId: z.string().regex(objectIdRegex, 'Invalid variant ID format').optional(),
      marketId: z.string().regex(objectIdRegex, 'Invalid market ID format').optional(),
      fuelCostAssumptions: z.number().min(0).optional(),
      insurance: z.number().min(0).optional(),
      registration: z.number().min(0).optional(),
      maintenance: z.number().min(0).optional(),
      service: z.number().min(0).optional(),
      depreciation: z.number().min(0).optional(),
      otherOwnershipCosts: z.number().min(0).optional(),
      ownershipPeriod: z.number().min(1).optional(),
      totalEstimatedCost: z.number().min(0).optional(),
      status: z.enum(['active', 'inactive']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const getCostToOwnSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid CostToOwn ID format'),
  }),
});

export const deleteCostToOwnSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid CostToOwn ID format'),
  }),
});
