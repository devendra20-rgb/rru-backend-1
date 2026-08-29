import { z } from 'zod';

export const createCustomAttributeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    key: z.string().min(1, 'Key is required').regex(/^[a-z0-9_]+$/, 'Key must contain only lowercase letters, numbers, and underscores'),
    type: z.enum(['text', 'number', 'boolean', 'select']),
    unit: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    appliesTo: z.string().min(1).default('Car'),
    isRequired: z.boolean().default(false),
    isActive: z.boolean().default(true),
    sortOrder: z.number().default(0),
    options: z.array(z.string().min(1)).optional().nullable(),
  }).refine((data) => {
    if (data.type === 'select' && (!data.options || data.options.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: 'Select type must have at least one option',
    path: ['options']
  })
});

export const updateCustomAttributeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    key: z.string().regex(/^[a-z0-9_]+$/).optional(),
    type: z.enum(['text', 'number', 'boolean', 'select']).optional(),
    unit: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    appliesTo: z.string().min(1).optional(),
    isRequired: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
    options: z.array(z.string().min(1)).optional().nullable(),
  })
});
