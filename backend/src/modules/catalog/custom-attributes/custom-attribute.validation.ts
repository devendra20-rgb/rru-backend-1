import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

const customAttributeTypeEnum = z.enum(['text', 'number', 'boolean', 'select', 'multi-select']);
const customAttributeAppliesToEnum = z.enum(['vehicle', 'variant', 'all']);
const statusEnum = z.enum(['active', 'inactive']);

export const createCustomAttributeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    key: z.string().trim().min(1, 'Key is required').regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores'),
    type: customAttributeTypeEnum,
    unit: z.string().trim().optional(),
    description: z.string().trim().optional(),
    appliesTo: customAttributeAppliesToEnum.optional(),
    isRequired: z.boolean().optional(),
    status: statusEnum.optional(),
    sortOrder: z.number().int().optional(),
    options: z.array(z.string()).optional(),
  }).refine((data) => {
    if ((data.type === 'select' || data.type === 'multi-select') && (!data.options || data.options.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: 'Options are required for select and multi-select types',
    path: ['options'],
  }),
});

export const updateCustomAttributeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    name: z.string().trim().min(1, 'Name is required').optional(),
    key: z.string().trim().min(1, 'Key is required').regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores').optional(),
    type: customAttributeTypeEnum.optional(),
    unit: z.string().trim().optional(),
    description: z.string().trim().optional(),
    appliesTo: customAttributeAppliesToEnum.optional(),
    isRequired: z.boolean().optional(),
    status: statusEnum.optional(),
    sortOrder: z.number().int().optional(),
    options: z.array(z.string()).optional(),
  }).refine((data) => {
    if ((data.type === 'select' || data.type === 'multi-select') && data.options !== undefined && data.options.length === 0) {
      return false;
    }
    return true;
  }, {
    message: 'Options are required for select and multi-select types',
    path: ['options'],
  }),
});

export const getCustomAttributeSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const getCustomAttributesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: statusEnum.optional(),
    appliesTo: customAttributeAppliesToEnum.optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
