import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category: string;
  authorId: string | { _id: string; username?: string; email?: string };
  status: 'published' | 'draft' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const getArticles = async (params?: Record<string, any>): Promise<PaginatedResponse<Article>> => {
  const response = await api.get('/articles', { params });
  return response.data;
};

export const getArticle = async (id: string): Promise<SingleResponse<Article>> => {
  const response = await api.get(`/articles/${id}`);
  return response.data;
};

export const createArticle = async (data: Partial<Article>): Promise<SingleResponse<Article>> => {
  const response = await api.post('/articles', data);
  return response.data;
};

export const updateArticle = async (id: string, data: Partial<Article>): Promise<SingleResponse<Article>> => {
  const response = await api.patch(`/articles/${id}`, data);
  return response.data;
};

export const deleteArticle = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/articles/${id}`);
  return response.data;
};
