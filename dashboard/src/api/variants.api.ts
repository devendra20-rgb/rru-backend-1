import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface Variant {
  _id: string;
  generationId: string | any;
  variantCode: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  modelYear?: number;
  fuelType?: string;
  transmissionType?: string;
  drivetrain?: string;
  engine?: {
    displacementCc?: number;
    cylinders?: number;
    aspiration?: string;
    powerHp?: number;
    torqueNm?: number;
  };
  seatingCapacity?: number;
  doors?: number;
  status: 'draft' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const getVariants = async (params?: Record<string, any>): Promise<PaginatedResponse<Variant>> => {
  const response = await api.get('/variants', { params });
  return response.data;
};

export const getVariant = async (id: string): Promise<SingleResponse<Variant>> => {
  const response = await api.get(`/variants/${id}`);
  return response.data;
};

export const createVariant = async (data: Partial<Variant>): Promise<SingleResponse<Variant>> => {
  const response = await api.post('/variants', data);
  return response.data;
};

export const updateVariant = async (id: string, data: Partial<Variant>): Promise<SingleResponse<Variant>> => {
  const response = await api.patch(`/variants/${id}`, data);
  return response.data;
};

export const deleteVariant = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/variants/${id}`);
  return response.data;
};
