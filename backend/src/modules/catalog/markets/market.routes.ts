import { Router } from 'express';
import {
  createMarket,
  getMarkets,
  getMarketById,
  getMarketByCode,
  updateMarket,
  deleteMarket,
} from './market.controller';
import variantMarketRoutes from '../variant-markets/variant-market.routes';
import { validate } from '../../../middlewares/validate.middleware';
import {
  createMarketSchema,
  updateMarketSchema,
  getMarketSchema,
  getMarketByCodeSchema,
  listMarketsSchema,
} from './market.validation';
import { authenticate, authorize } from '../../../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use('/:marketId/variants', variantMarketRoutes);

// Public routes
router.get('/', validate(listMarketsSchema), getMarkets);
router.get('/:id', validate(getMarketSchema), getMarketById);
router.get('/code/:code', validate(getMarketByCodeSchema), getMarketByCode);

// Protected admin/editor routes
router.use(authenticate);

router.post('/', authorize('admin', 'editor'), validate(createMarketSchema), createMarket);

router.patch('/:id', authorize('admin', 'editor'), validate(updateMarketSchema), updateMarket);

// Only admins can deactivate markets
router.delete('/:id', authorize('admin'), validate(getMarketSchema), deleteMarket);

export default router;
