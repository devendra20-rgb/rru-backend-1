import { Router } from 'express';
import {
  createSpecification,
  getSpecifications,
  getSpecificationById,
  getSpecificationByVariantId,
  updateSpecification,
  deleteSpecification,
} from './specification.controller';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  createSpecificationSchema,
  updateSpecificationSchema,
  getSpecificationSchema,
  getSpecificationByVariantSchema,
  getSpecificationsSchema,
} from './specification.validation';

const router = Router({ mergeParams: true });

// Public routes
router.get('/', validate(getSpecificationsSchema), getSpecifications);
router.get('/:id', validate(getSpecificationSchema), getSpecificationById);
router.get(
  '/variant/:variantId',
  validate(getSpecificationByVariantSchema),
  getSpecificationByVariantId,
);

// Protected routes (Admin/Editor)
router.use(authenticate);
router.use(authorize('admin', 'editor'));

router.post('/', validate(createSpecificationSchema), createSpecification);
router.patch('/:id', validate(updateSpecificationSchema), updateSpecification);
router.delete('/:id', validate(getSpecificationSchema), deleteSpecification);

export const specificationRoutes = router;
