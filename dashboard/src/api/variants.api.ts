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

export interface VariantTemplateCandidate {
  sourceVariantId: string;
  name: string;
  variantCode?: string;
  status?: string;
  modelId?: string;
  generationId?: string | null;
  modelYear?: number;
  fuelType?: string;
  transmissionType?: string;
  drivetrain?: string;
  engine?: Variant['engine'];
  seatingCapacity?: number;
  doors?: number;
  description?: string;
  shortDescription?: string;
  _sourceName?: string;
  _completenessScore?: number;
}

export interface VariantTemplateResult {
  found: boolean;
  requiresSelection?: boolean;
  message: string;
  candidates?: VariantTemplateCandidate[];
  sourceVariantId: string | null;
  sourceVariant: {
    modelId?: string;
    generationId?: string | null;
    modelYear?: number;
    fuelType?: string;
    transmissionType?: string;
    drivetrain?: string;
    engine?: Variant['engine'];
    seatingCapacity?: number;
    doors?: number;
    description?: string;
    shortDescription?: string;
    _sourceName?: string;
    _completenessScore?: number;
  } | null;
}

export const getVariantTemplate = async (params: {
  modelId: string;
  generationId?: string;
  excludeVariantId?: string;
}): Promise<SingleResponse<VariantTemplateResult>> => {
  const response = await api.get('/variants/template', { params });
  return response.data;
};

export const populateVariantFromSource = async (
  targetVariantId: string,
  sourceVariantId: string,
): Promise<SingleResponse<{ targetVariantId: string; sourceVariantId: string; summary: any }>> => {
  const response = await api.post(`/variants/${targetVariantId}/populate-from`, {
    sourceVariantId,
  });
  return response.data;
};
