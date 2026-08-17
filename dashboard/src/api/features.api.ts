import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface Feature {
  _id: string;
  name: string;
  category: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const getFeatures = async (params?: Record<string, any>): Promise<any> => {
  const response = await api.get('/features', { params });
  return response.data;
};

export const getFeature = async (id: string): Promise<SingleResponse<Feature>> => {
  const response = await api.get(`/features/${id}`);
  return response.data;
};

export const createFeature = async (data: Partial<Feature>): Promise<SingleResponse<Feature>> => {
  const response = await api.post('/features', data);
  return response.data;
};

export const updateFeature = async (id: string, data: Partial<Feature>): Promise<SingleResponse<Feature>> => {
  const response = await api.patch(`/features/${id}`, data);
  return response.data;
};

export const deleteFeature = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/features/${id}`);
  return response.data;
};

// Variant Features Mapping
export interface VariantFeature {
  _id: string;
  variantId: string | any;
  featureId: string | any;
  availability: 'standard' | 'optional' | 'unavailable';
  value?: string;
  status: 'active' | 'inactive';
}

export const getVariantFeatures = async (variantId: string): Promise<PaginatedResponse<VariantFeature>> => {
  const response = await api.get('/variant-features', { params: { variantId, limit: 200 } });
  return response.data;
};

export const createVariantFeature = async (data: Partial<VariantFeature>): Promise<SingleResponse<VariantFeature>> => {
  const response = await api.post('/variant-features', data);
  return response.data;
};

export const updateVariantFeature = async (id: string, data: Partial<VariantFeature>): Promise<SingleResponse<VariantFeature>> => {
  const response = await api.patch(`/variant-features/${id}`, data);
  return response.data;
};

export const deleteVariantFeature = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/variant-features/${id}`);
  return response.data;
};

