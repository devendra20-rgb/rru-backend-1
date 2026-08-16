import { AppError } from '../../middlewares/error.middleware';
import { ReviewRepository } from './review.repository';
import { CreateReviewInput, UpdateReviewInput, ReviewQuery, IReview } from './review.types';
import { Variant } from '../catalog/variants/variant.model';
import { User } from '../users/user.model';

export class ReviewService {
  private repository: ReviewRepository;

  constructor() {
    this.repository = new ReviewRepository();
  }

  async createReview(data: CreateReviewInput): Promise<IReview> {
    const [variantExists, userExists] = await Promise.all([
      Variant.findById(data.variantId),
      User.findById(data.userId),
    ]);

    if (!variantExists) {
      throw new AppError('Variant not found', 404);
    }
    if (!userExists) {
      throw new AppError('User not found', 404);
    }

    const existingReview = await this.repository.findByVariantAndUser(data.variantId, data.userId);
    if (existingReview) {
      throw new AppError('You have already reviewed this variant', 409);
    }

    // Auto-approve for admins/editors, or default to pending
    const status =
      userExists.role === 'admin' || userExists.role === 'editor' ? 'approved' : 'pending';

    const createdReview = await this.repository.create({ ...data, status });
    return createdReview.toObject();
  }

  async getReviewById(id: string): Promise<IReview> {
    const review = await this.repository.findById(id);
    if (!review) {
      throw new AppError('Review not found', 404);
    }
    return review.toObject();
  }

  async getVariantReviews(variantId: string, query: ReviewQuery) {
    const variantExists = await Variant.findById(variantId);
    if (!variantExists) {
      throw new AppError('Variant not found', 404);
    }

    // Force status to approved for public queries unless overridden by an admin flow later
    // The controller will determine if we should allow viewing pending/rejected
    const result = await this.repository.findMany({ ...query, variantId });
    const summary = await this.repository.getAverageRating(variantId);

    return {
      reviews: result.data,
      total: result.total,
      summary,
    };
  }

  async getReviews(query: ReviewQuery) {
    return this.repository.findMany(query);
  }

  async updateReview(
    id: string,
    data: UpdateReviewInput,
    requestingUserId: string,
    requestingUserRole: string,
  ): Promise<IReview> {
    const review = await this.repository.findById(id);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    const isOwner = review.userId.toString() === requestingUserId;
    const isAdmin = requestingUserRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('You do not have permission to update this review', 403);
    }

    // Only admins can change the status
    if (data.status && !isAdmin) {
      throw new AppError('You do not have permission to change the review status', 403);
    }

    const updatedReview = await this.repository.update(id, data);
    return updatedReview!.toObject();
  }

  async deleteReview(
    id: string,
    requestingUserId: string,
    requestingUserRole: string,
  ): Promise<void> {
    const review = await this.repository.findById(id);
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    const isOwner = review.userId.toString() === requestingUserId;
    const isAdmin = requestingUserRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('You do not have permission to delete this review', 403);
    }

    await this.repository.delete(id);
  }
}
