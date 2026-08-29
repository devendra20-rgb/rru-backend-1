import { Types } from 'mongoose';
import { Review, IReviewDocument } from './review.model';
import { CreateReviewInput, UpdateReviewInput, ReviewQuery } from './review.types';

export class ReviewRepository {
  async create(data: CreateReviewInput & { status?: string }): Promise<IReviewDocument> {
    const review = new Review(data);
    return review.save();
  }

  async findById(id: string): Promise<IReviewDocument | null> {
    return Review.findById(id).exec();
  }

  async findByVariantAndUser(variantId: string, userId: string): Promise<IReviewDocument | null> {
    return Review.findOne({ variantId, userId }).exec();
  }

  async update(id: string, data: UpdateReviewInput): Promise<IReviewDocument | null> {
    return Review.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<IReviewDocument | null> {
    return Review.findByIdAndDelete(id).exec();
  }

  async findMany(query: ReviewQuery): Promise<{ data: IReviewDocument[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      variantId,
      userId,
      status,
      search,
    } = query;

    const filter: Record<string, any> = {};
    if (variantId) filter.variantId = new Types.ObjectId(variantId);
    if (userId) filter.userId = new Types.ObjectId(userId);
    if (status) filter.status = status;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Review.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username') // Only populate username for public safety
        .populate({
          path: 'variantId',
          select: 'name variantCode generationId',
          populate: {
            path: 'generationId',
            select: 'name modelId',
            populate: {
              path: 'modelId',
              select: 'name brandId',
              populate: {
                path: 'brandId',
                select: 'name'
              }
            }
          }
        })
        .exec(),
      Review.countDocuments(filter),
    ]);

    return { data, total };
  }

  async getAverageRating(variantId: string): Promise<{ average: number; count: number }> {
    const result = await Review.aggregate([
      { $match: { variantId: new Types.ObjectId(variantId), status: 'approved' } },
      {
        $group: {
          _id: '$variantId',
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      return { average: Math.round(result[0].average * 10) / 10, count: result[0].count };
    }
    return { average: 0, count: 0 };
  }
}
