import { Router } from 'express';
import { featureController } from './feature.controller';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  createFeatureSchema,
  updateFeatureSchema,
  createVariantFeatureSchema,
  updateVariantFeatureSchema,
  featureQuerySchema,
  variantFeatureQuerySchema,
} from './feature.validation';

// Features Router
export const featureRouter = Router();

// Public routes
featureRouter.get('/', validate(featureQuerySchema), featureController.getFeatures);
featureRouter.get('/:id', featureController.getFeatureById);
featureRouter.get('/slug/:slug', featureController.getFeatureBySlug);

// Protected routes
featureRouter.use(authenticate, authorize('admin', 'editor'));

featureRouter.post('/', validate(createFeatureSchema), featureController.createFeature);
featureRouter.patch('/:id', validate(updateFeatureSchema), featureController.updateFeature);
featureRouter.delete('/:id', featureController.deleteFeature);

// VariantFeatures Router
export const variantFeatureRouter = Router();

// Public routes
variantFeatureRouter.get(
  '/',
  validate(variantFeatureQuerySchema),
  featureController.getVariantFeatures,
);
variantFeatureRouter.get('/:id', featureController.getVariantFeatureById);

// Protected routes
variantFeatureRouter.use(authenticate, authorize('admin', 'editor'));

variantFeatureRouter.post(
  '/',
  validate(createVariantFeatureSchema),
  featureController.createVariantFeature,
);
variantFeatureRouter.patch(
  '/:id',
  validate(updateVariantFeatureSchema),
  featureController.updateVariantFeature,
);
variantFeatureRouter.delete('/:id', featureController.deleteVariantFeature);

export default {
  featureRouter,
  variantFeatureRouter,
};
