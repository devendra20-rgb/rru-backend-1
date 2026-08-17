import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface Model {
  _id: string;
  brandId: string | any;
  modelCode: string;
  name: string;
  slug: string;
  bodyType?: string;
  segment?: string;
  launchYear?: number;
  description?: string;
  shortDescription?: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export const getModels = async (params?: Record<string, any>): Promise<PaginatedResponse<Model>> => {
  const response = await api.get('/models', { params });
  return response.data;
};

export const getModel = async (id: string): Promise<SingleResponse<Model>> => {
  const response = await api.get(`/models/${id}`);
  return response.data;
};

export const createModel = async (data: Partial<Model>): Promise<SingleResponse<Model>> => {
  const response = await api.post('/models', data);
  return response.data;
};

export const updateModel = async (id: string, data: Partial<Model>): Promise<SingleResponse<Model>> => {
  const response = await api.patch(`/models/${id}`, data);
  return response.data;
};

export const deleteModel = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/models/${id}`);
  return response.data;
};
