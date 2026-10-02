import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middlewares/validate.middleware';
import { createContactSchema } from './contact.validation';
import { handleContactSubmit } from './contact.controller';

const router = Router();

// Rate limiter for contact endpoint: max 5 requests per 15 minutes per IP
const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact form submissions from this IP. Please try again after 15 minutes.',
  },
});

router.post('/', contactRateLimiter, validate(createContactSchema), handleContactSubmit);

export default router;
