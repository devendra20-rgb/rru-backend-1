import { Types } from 'mongoose';
import { PaginationQuery } from '../../utils/pagination';

export interface IReview {
  _id?: Types.ObjectId;
  variantId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number; // 1 to 5
  title?: string;
  content?: string;
  body?: string; // Kept for backward compatibility
  pros?: string[];
  cons?: string[];
  status: 'approved' | 'pending' | 'rejected' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateReviewInput {
  variantId: string;
  rating: number;
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
  userId: string; // From auth
  status?: 'approved' | 'pending' | 'rejected' | 'inactive';
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
  status?: 'approved' | 'pending' | 'rejected' | 'inactive';
}

export interface ReviewQuery extends PaginationQuery {
  variantId?: string;
  userId?: string;
  status?: 'approved' | 'pending' | 'rejected' | 'inactive';
  search?: string;
}
