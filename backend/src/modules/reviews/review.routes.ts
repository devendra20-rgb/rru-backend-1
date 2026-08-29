import { Router } from 'express';
import { ReviewController } from './review.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate, authorize, extractUser } from '../../middlewares/auth.middleware';
import {
  createReviewSchema,
  createAdminReviewSchema,
  updateReviewSchema,
  getReviewSchema,
  deleteReviewSchema,
  getVariantReviewsSchema,
} from './review.validation';

const router = Router();
const controller = new ReviewController();

// Public routes
// Mounted at /api/v1/variants/:variantId/reviews from another router, or just here
router.get(
  '/variants/:variantId/reviews',
  validate(getVariantReviewsSchema),
  controller.getVariantReviews,
);

// Moderation / general endpoints for reviews
router.get('/reviews', extractUser, controller.getReviews);
router.get(
  '/reviews/:id',
  extractUser,
  validate(getReviewSchema),
  controller.getReviewById,
);

// Protected routes
// We'll also mount the creation at /api/v1/variants/:variantId/reviews to be clean
router.post(
  '/variants/:variantId/reviews',
  authenticate,
  authorize('admin', 'editor'), // Note: the user is 'editor' or 'admin'
  (req, res, next) => {
    req.body.variantId = req.params.variantId;
    next();
  },
  validate(createReviewSchema),
  controller.createReview,
);

// Admin / dashboard review creation
router.post(
  '/reviews',
  authenticate,
  authorize('admin', 'editor'),
  validate(createAdminReviewSchema),
  controller.createReview,
);

// Update/Delete a specific review by ID
router.patch(
  '/reviews/:id',
  authenticate,
  authorize('admin', 'editor'),
  validate(updateReviewSchema),
  controller.updateReview,
);
router.delete(
  '/reviews/:id',
  authenticate,
  authorize('admin', 'editor'),
  validate(deleteReviewSchema),
  controller.deleteReview,
);

export default router;
