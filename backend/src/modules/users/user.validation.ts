import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    role: z.enum(['admin', 'editor']).default('editor'),
    status: z.enum(['active', 'inactive']).default('active'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
  body: z.object({
    username: z.string().min(3).max(30).optional(),
    email: z.string().email().optional(),
    role: z.enum(['admin', 'editor']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100),
  }),
});
