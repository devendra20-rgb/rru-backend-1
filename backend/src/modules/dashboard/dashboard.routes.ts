import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

// Only admin/editor should see dashboard stats
router.get('/stats', authenticate, authorize('admin', 'editor'), dashboardController.getStats);

export default router;
