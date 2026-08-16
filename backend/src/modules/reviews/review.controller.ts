import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import { sendSuccess } from '../../utils/response';
import { getPaginationOptions, getPaginationMeta } from '../../utils/pagination';

export class ReviewController {
  private service: ReviewService;

  constructor() {
    this.service = new ReviewService();
  }

  createReview = async (req: Request, res: Response) => {
    // req.user is guaranteed to be set by the authenticate middleware
    const userId = req.user!.userId;
    const review = await this.service.createReview({ ...req.body, userId });
    return sendSuccess(res, 201, 'Review created successfully', review);
  };

  getVariantReviews = async (req: Request, res: Response) => {
    const { page, limit } = getPaginationOptions(req.query as any);
    const { variantId } = req.params;

    const result = await this.service.getVariantReviews(
      req.params.variantId as string,
      {
        ...req.query,
        status: 'approved',
      } as any,
    );

    return sendSuccess(res, 200, 'Reviews retrieved successfully', result.reviews, {
      ...getPaginationMeta(result.total, page, limit),
      ...result.summary,
    });
  };

  getReviews = async (req: Request, res: Response) => {
    const { page, limit } = getPaginationOptions(req.query as any);
    const result = await this.service.getReviews(req.query as any);

    return sendSuccess(
      res,
      200,
      'Reviews retrieved successfully',
      result.data,
      getPaginationMeta(result.total, page, limit),
    );
  };

  getReviewById = async (req: Request, res: Response) => {
    const review = await this.service.getReviewById(req.params.id as string);
    return sendSuccess(res, 200, 'Review retrieved successfully', review);
  };

  updateReview = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const review = await this.service.updateReview(
      req.params.id as string,
      req.body,
      userId,
      userRole,
    );
    return sendSuccess(res, 200, 'Review updated successfully', review);
  };

  deleteReview = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    await this.service.deleteReview(req.params.id as string, userId, userRole);
    return sendSuccess(res, 200, 'Review deleted successfully');
  };
}
