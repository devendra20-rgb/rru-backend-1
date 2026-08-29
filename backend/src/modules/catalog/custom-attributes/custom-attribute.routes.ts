import { Router } from 'express';
import { CustomAttributeController } from './custom-attribute.controller';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { createCustomAttributeSchema, updateCustomAttributeSchema } from './custom-attribute.validation';

const router = Router();

// Public routes for fetching active attributes
router.get('/', CustomAttributeController.getCustomAttributes);
router.get('/:id', CustomAttributeController.getCustomAttributeById);

// Protected routes
router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

router.post(
  '/',
  validate(createCustomAttributeSchema),
  CustomAttributeController.createCustomAttribute
);

router.patch(
  '/:id',
  validate(updateCustomAttributeSchema),
  CustomAttributeController.updateCustomAttribute
);

router.delete('/:id', CustomAttributeController.deleteCustomAttribute);

export default router;
