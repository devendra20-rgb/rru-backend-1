import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface Color {
  _id: string;
  name: string;
  colorCode?: string;
  hexCode?: string;
  colorFamily?: string;
  finishType?: 'solid' | 'metallic' | 'matte' | 'pearlescent';
  type: 'exterior' | 'interior';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
//
export const getColors = async (params?: Record<string, any>): Promise<any> => {
  const response = await api.get('/colors', { params });
  return response.data;
};

export const getColor = async (id: string): Promise<SingleResponse<Color>> => {
  const response = await api.get(`/colors/${id}`);
  return response.data;
};

export const createColor = async (data: Partial<Color>): Promise<SingleResponse<Color>> => {
  const response = await api.post('/colors', data);
  return response.data;
};

export const updateColor = async (id: string, data: Partial<Color>): Promise<SingleResponse<Color>> => {
  const response = await api.patch(`/colors/${id}`, data);
  return response.data;
};

export const deleteColor = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/colors/${id}`);
  return response.data;
};

// Variant Colors Mapping
export interface VariantColor {
  _id: string;
  variantId: string | any;
  colorId: string | any;
  availability: 'standard' | 'optional' | 'unavailable';
  status: 'active' | 'inactive';
}

export const getVariantColors = async (variantId: string): Promise<PaginatedResponse<VariantColor>> => {
  const response = await api.get('/variant-colors', { params: { variantId, limit: 100 } });
  return response.data;
};

export const createVariantColor = async (data: Partial<VariantColor>): Promise<SingleResponse<VariantColor>> => {
  const response = await api.post('/variant-colors', data);
  return response.data;
};

export const updateVariantColor = async (id: string, data: Partial<VariantColor>): Promise<SingleResponse<VariantColor>> => {
  const response = await api.patch(`/variant-colors/${id}`, data);
  return response.data;
};

export const deleteVariantColor = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/variant-colors/${id}`);
  return response.data;
};

