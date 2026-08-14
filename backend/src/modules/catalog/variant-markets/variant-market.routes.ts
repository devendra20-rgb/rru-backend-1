import { Router } from 'express';
import { z } from 'zod';
import * as variantMarketController from './variant-market.controller';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  CreateVariantMarketSchema,
  UpdateVariantMarketSchema,
  VariantMarketIdParamSchema,
  VariantMarketListQuerySchema,
} from './variant-market.validation';

const router = Router({ mergeParams: true });

// Public routes
router.get(
  '/',
  validate(z.object({ query: VariantMarketListQuerySchema }) as any),
  variantMarketController.getVariantMarkets,
);

router.get(
  '/:id',
  validate(z.object({ params: VariantMarketIdParamSchema }) as any),
  variantMarketController.getVariantMarketById,
);

// Protected routes (Admin & Editor)
router.use(authenticate);
router.use(authorize('admin', 'editor'));

router.post(
  '/',
  validate(z.object({ body: CreateVariantMarketSchema }) as any),
  variantMarketController.createVariantMarket,
);

router.patch(
  '/:id',
  validate(
    z.object({
      params: VariantMarketIdParamSchema,
      body: UpdateVariantMarketSchema,
    }) as any,
  ),
  variantMarketController.updateVariantMarket,
);

router.delete(
  '/:id',
  validate(z.object({ params: VariantMarketIdParamSchema }) as any),
  variantMarketController.deleteVariantMarket,
);

export default router;
