import { Router } from 'express';
import { z } from 'zod';
import * as variantController from './variant.controller';
import variantMarketRoutes from '../variant-markets/variant-market.routes';
import { specificationRoutes } from '../specifications/specification.routes';
import { featureController } from '../features/feature.controller';
import { colorController } from '../colors/color.controller';
import { mediaController } from '../../media/media.controller';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  CreateVariantSchema,
  UpdateVariantSchema,
  VariantIdParamSchema,
  VariantSlugParamSchema,
  VariantListQuerySchema,
} from './variant.validation';

const router = Router({ mergeParams: true });

router.use('/:variantId/markets', variantMarketRoutes);
router.use('/:variantId/specifications', specificationRoutes);
router.get('/:variantId/features', featureController.getFeaturesByVariantId);
router.get('/:variantId/colors', colorController.getColorsByVariantId);
router.get('/:variantId/media', mediaController.getMediaByVariantId);

// Public routes
router.get('/', validate(z.object({ query: VariantListQuerySchema }) as any), (req, res, next) => {
  if (req.params.generationId) {
    return variantController.getVariantsByGeneration(req, res, next);
  }
  return variantController.getVariants(req, res, next);
});
router.get(
  '/slug/:slug',
  validate(z.object({ params: VariantSlugParamSchema }) as any),
  variantController.getVariantBySlug,
);
router.get(
  '/:id',
  validate(z.object({ params: VariantIdParamSchema }) as any),
  variantController.getVariantById,
);

// Protected routes (Admin / Editor)
router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'editor'),
  validate(CreateVariantSchema as any),
  variantController.createVariant,
);
router.patch(
  '/:id',
  authorize('admin', 'editor'),
  validate(UpdateVariantSchema as any),
  variantController.updateVariant,
);

// Delete typically restricted to admin
router.delete(
  '/:id',
  authorize('admin'),
  validate(z.object({ params: VariantIdParamSchema }) as any),
  variantController.deleteVariant,
);

export default router;
