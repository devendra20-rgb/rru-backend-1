import { z } from 'zod';

export const loginSchema = z.object({
  body: z
    .object({
      username: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().min(1, 'Password is required'),
    })
    .refine((data) => data.username || data.email, {
      message: 'Either username or email must be provided',
      path: ['username'],
    }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});
