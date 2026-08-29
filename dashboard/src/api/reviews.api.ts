import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface Review {
  _id: string;
  variantId?: any; // To allow populate
  authorId?: any;
  title: string;
  content: string;
  rating: number; // e.g. 1-10 or 1-5
  pros?: string[];
  cons?: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export const getReviews = async (params?: Record<string, any>): Promise<PaginatedResponse<Review>> => {
  const response = await api.get('/reviews', { params });
  return response.data;
};

export const getReview = async (id: string): Promise<SingleResponse<Review>> => {
  const response = await api.get(`/reviews/${id}`);
  return response.data;
};

export const createReview = async (data: Partial<Review>): Promise<SingleResponse<Review>> => {
  const response = await api.post('/reviews', data);
  return response.data;
};

export const updateReview = async (id: string, data: Partial<Review>): Promise<SingleResponse<Review>> => {
  const response = await api.patch(`/reviews/${id}`, data);
  return response.data;
};

export const deleteReview = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};
