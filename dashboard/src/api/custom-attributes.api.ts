import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export type CustomAttributeType = 'text' | 'number' | 'boolean' | 'select' | 'multi-select';
export type CustomAttributeAppliesTo = 'vehicle' | 'variant' | 'all';
export type CustomAttributeStatus = 'active' | 'inactive';

export interface CustomAttribute {
  _id: string;
  name: string;
  key: string;
  type: CustomAttributeType;
  unit?: string;
  description?: string;
  appliesTo: CustomAttributeAppliesTo;
  isRequired: boolean;
  status: CustomAttributeStatus;
  sortOrder: number;
  options?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getCustomAttributes = async (params?: Record<string, any>): Promise<PaginatedResponse<CustomAttribute>> => {
  const response = await api.get('/custom-attributes', { params });
  return response.data;
};

export const getCustomAttribute = async (id: string): Promise<SingleResponse<CustomAttribute>> => {
  const response = await api.get(`/custom-attributes/${id}`);
  return response.data;
};

export const createCustomAttribute = async (data: Partial<CustomAttribute>): Promise<SingleResponse<CustomAttribute>> => {
  const response = await api.post('/custom-attributes', data);
  return response.data;
};

export const updateCustomAttribute = async (id: string, data: Partial<CustomAttribute>): Promise<SingleResponse<CustomAttribute>> => {
  const response = await api.patch(`/custom-attributes/${id}`, data);
  return response.data;
};

export const deleteCustomAttribute = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/custom-attributes/${id}`);
  return response.data;
};
