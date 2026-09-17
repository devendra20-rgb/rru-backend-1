import api from '../lib/axios';
import type { SingleResponse } from './brands.api';

export interface Review {
  _id: string;
  variantId: string | { _id: string; name?: string; variantCode?: string };
  userId: string | { _id: string; username?: string; email?: string };
  rating: number;
  title?: string;
  body?: string;
  status: 'approved' | 'pending' | 'rejected' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const getReviews = async (
  params?: Record<string, any>,
): Promise<{ data: Review[]; total: number; meta?: { total?: number } }> => {
  const response = await api.get('/reviews', { params });
  const envelope = response.data;
  const list = Array.isArray(envelope?.data) ? envelope.data : [];
  const total = envelope?.meta?.total ?? list.length;
  return { data: list, total, meta: envelope?.meta };
};

export const getReview = async (id: string): Promise<SingleResponse<Review>> => {
  const response = await api.get(`/reviews/${id}`);
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
