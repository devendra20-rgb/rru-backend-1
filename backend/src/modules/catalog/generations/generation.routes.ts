import { Router } from 'express';
import { z } from 'zod';
import * as generationController from './generation.controller';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  CreateGenerationSchema,
  UpdateGenerationSchema,
  GenerationIdParamSchema,
  GenerationSlugParamSchema,
  GenerationListQuerySchema,
} from './generation.validation';

const router = Router({ mergeParams: true });

// Public routes
router.get('/', validate(z.object({ query: GenerationListQuerySchema }) as any), (req, res, next) => {
  if (req.params.modelId) {
    return generationController.getGenerationsByModel(req, res, next);
  }
  return generationController.getGenerations(req, res, next);
});
router.get(
  '/slug/:slug',
  validate(z.object({ params: GenerationSlugParamSchema }) as any),
  generationController.getGenerationBySlug,
);
router.get(
  '/:id',
  validate(z.object({ params: GenerationIdParamSchema }) as any),
  generationController.getGenerationById,
);

// Protected routes (Admin / Editor)
router.use(authenticate, authorize('admin', 'editor'));

router.post('/', validate(CreateGenerationSchema as any), generationController.createGeneration);
router.patch(
  '/:id',
  validate(UpdateGenerationSchema as any),
  generationController.updateGeneration,
);
router.delete(
  '/:id',
  validate(z.object({ params: GenerationIdParamSchema }) as any),
  generationController.deleteGeneration,
);

export default router;
