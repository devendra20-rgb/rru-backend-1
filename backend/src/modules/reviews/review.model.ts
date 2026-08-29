import { Schema, model, Document } from 'mongoose';
import { IReview } from './review.types';

export interface IReviewDocument extends IReview, Document {
  _id: any;
}

const reviewSchema = new Schema<IReviewDocument>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'Variant',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    body: {
      type: String, // Kept for backwards compatibility
      trim: true,
      maxlength: 2000,
    },
    pros: [{
      type: String,
      trim: true,
      maxlength: 200,
    }],
    cons: [{
      type: String,
      trim: true,
      maxlength: 200,
    }],
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected', 'inactive'],
      default: 'pending', // Assume moderation required by default
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
reviewSchema.index({ variantId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ variantId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ variantId: 1, status: 1 }); // Useful for getting public reviews for a variant

export const Review = model<IReviewDocument>('Review', reviewSchema);
