import { Router } from 'express';
import { z } from 'zod';
import * as brandController from './brand.controller';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  CreateBrandSchema,
  UpdateBrandSchema,
  BrandIdParamSchema,
  BrandSlugParamSchema,
  BrandListQuerySchema,
} from './brand.validation';

const router = Router();

// Public routes
router.get('/', validate(z.object({ query: BrandListQuerySchema }) as any), brandController.getBrands);
router.get('/slug/:slug', validate(z.object({ params: BrandSlugParamSchema }) as any), brandController.getBrandBySlug);
router.get('/:id', validate(z.object({ params: BrandIdParamSchema }) as any), brandController.getBrandById);

// Protected routes (Admin / Editor)
router.use(authenticate, authorize('admin', 'editor'));

router.post('/', validate(CreateBrandSchema as any), brandController.createBrand);
router.patch('/:id', validate(UpdateBrandSchema as any), brandController.updateBrand);
router.delete('/:id', validate(z.object({ params: BrandIdParamSchema }) as any), brandController.deleteBrand);

export default router;
