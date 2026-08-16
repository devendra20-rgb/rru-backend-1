import { Router } from 'express';
import { CostToOwnController } from './cost-to-own.controller';
import { validate } from '../../../middlewares/validate.middleware';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';
import {
  createCostToOwnSchema,
  updateCostToOwnSchema,
  getCostToOwnSchema,
  deleteCostToOwnSchema,
} from './cost-to-own.validation';

const router = Router();
const controller = new CostToOwnController();

// Public routes
router.get('/', controller.getCostsToOwn);
router.get('/:id', validate(getCostToOwnSchema), controller.getCostToOwnById);

// Protected routes
router.use(authenticate);

router.post(
  '/',
  authorize('admin', 'editor'),
  validate(createCostToOwnSchema),
  controller.createCostToOwn,
);

router.patch(
  '/:id',
  authorize('admin', 'editor'),
  validate(updateCostToOwnSchema),
  controller.updateCostToOwn,
);

router.delete(
  '/:id',
  authorize('admin', 'editor'),
  validate(deleteCostToOwnSchema),
  controller.deleteCostToOwn,
);

export default router;
