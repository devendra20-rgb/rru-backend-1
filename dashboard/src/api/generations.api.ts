import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface Generation {
  _id: string;
  modelId: string | any;
  generationCode: string;
  name: string;
  slug: string;
  generationNumber?: number;
  startYear?: number;
  endYear?: number;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export const getGenerations = async (params?: Record<string, any>): Promise<PaginatedResponse<Generation>> => {
  const response = await api.get('/generations', { params });
  return response.data;
};

export const getGeneration = async (id: string): Promise<SingleResponse<Generation>> => {
  const response = await api.get(`/generations/${id}`);
  return response.data;
};

export const createGeneration = async (data: Partial<Generation>): Promise<SingleResponse<Generation>> => {
  const response = await api.post('/generations', data);
  return response.data;
};

export const updateGeneration = async (id: string, data: Partial<Generation>): Promise<SingleResponse<Generation>> => {
  const response = await api.patch(`/generations/${id}`, data);
  return response.data;
};

export const deleteGeneration = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/generations/${id}`);
  return response.data;
};
