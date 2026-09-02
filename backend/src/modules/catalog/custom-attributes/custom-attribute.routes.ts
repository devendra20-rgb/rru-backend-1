import { Router } from 'express';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  createCustomAttribute,
  getCustomAttributes,
  getCustomAttributeById,
  updateCustomAttribute,
  deleteCustomAttribute,
} from './custom-attribute.controller';
import {
  createCustomAttributeSchema,
  updateCustomAttributeSchema,
  getCustomAttributeSchema,
  getCustomAttributesSchema,
} from './custom-attribute.validation';

const router = Router();

router.use(authenticate);

router
  .route('/')
  .get(validate(getCustomAttributesSchema), getCustomAttributes)
  .post(authorize('admin'), validate(createCustomAttributeSchema), createCustomAttribute);

router
  .route('/:id')
  .get(validate(getCustomAttributeSchema), getCustomAttributeById)
  .patch(authorize('admin'), validate(updateCustomAttributeSchema), updateCustomAttribute)
  .delete(authorize('admin'), validate(getCustomAttributeSchema), deleteCustomAttribute);

export default router;
