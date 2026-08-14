import { Router } from 'express';
import { z } from 'zod';
import * as modelController from './model.controller';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  CreateModelSchema,
  UpdateModelSchema,
  ModelIdParamSchema,
  ModelSlugParamSchema,
  ModelListQuerySchema,
} from './model.validation';

const router = Router({ mergeParams: true });

// Public routes
router.get('/', validate(z.object({ query: ModelListQuerySchema }) as any), (req, res, next) => {
  if (req.params.brandId) {
    return modelController.getModelsByBrand(req, res, next);
  }
  return modelController.getModels(req, res, next);
});
router.get('/slug/:slug', validate(z.object({ params: ModelSlugParamSchema }) as any), modelController.getModelBySlug);
router.get('/:id', validate(z.object({ params: ModelIdParamSchema }) as any), modelController.getModelById);

// Protected routes (Admin / Editor)
router.use(authenticate, authorize('admin', 'editor'));

router.post('/', validate(CreateModelSchema as any), modelController.createModel);
router.patch('/:id', validate(UpdateModelSchema as any), modelController.updateModel);
router.delete('/:id', validate(z.object({ params: ModelIdParamSchema }) as any), modelController.deleteModel);

export default router;
