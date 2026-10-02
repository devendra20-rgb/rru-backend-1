import { z } from 'zod';

export const createContactSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters'),
    email: z
      .string({ message: 'Email address is required' })
      .trim()
      .email('Please enter a valid email address'),
    subject: z
      .string({ message: 'Subject is required' })
      .trim()
      .min(1, 'Subject is required')
      .max(150, 'Subject must not exceed 150 characters'),
    message: z
      .string({ message: 'Message is required' })
      .trim()
      .min(10, 'Message must be at least 10 characters')
      .max(3000, 'Message must not exceed 3000 characters'),
  }),
});
