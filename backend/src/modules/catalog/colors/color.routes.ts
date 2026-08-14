import { Router } from 'express';
import { colorController } from './color.controller';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  createColorSchema,
  updateColorSchema,
  createVariantColorSchema,
  updateVariantColorSchema,
  colorQuerySchema,
  variantColorQuerySchema,
} from './color.validation';

// Colors Router
export const colorRouter = Router();

// Public routes
colorRouter.get('/', validate(colorQuerySchema), colorController.getColors);
colorRouter.get('/slug/:slug', colorController.getColorBySlug);
colorRouter.get('/:id', colorController.getColorById);

// Protected routes
colorRouter.use(authenticate, authorize('admin', 'editor'));

colorRouter.post('/', validate(createColorSchema), colorController.createColor);
colorRouter.patch('/:id', validate(updateColorSchema), colorController.updateColor);
colorRouter.delete('/:id', colorController.deleteColor);

// VariantColors Router
export const variantColorRouter = Router();

// Public routes
variantColorRouter.get('/', validate(variantColorQuerySchema), colorController.getVariantColors);
variantColorRouter.get('/:id', colorController.getVariantColorById);

// Protected routes
variantColorRouter.use(authenticate, authorize('admin', 'editor'));

variantColorRouter.post(
  '/',
  validate(createVariantColorSchema),
  colorController.createVariantColor,
);
variantColorRouter.patch(
  '/:id',
  validate(updateVariantColorSchema),
  colorController.updateVariantColor,
);
variantColorRouter.delete('/:id', colorController.deleteVariantColor);

export default {
  colorRouter,
  variantColorRouter,
};
