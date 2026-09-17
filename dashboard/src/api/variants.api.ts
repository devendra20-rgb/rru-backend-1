import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface PopulatedRef {
  _id: string;
  name?: string;
  brandId?: string | PopulatedRef;
}

export interface Variant {
  _id: string;
  modelId?: string | PopulatedRef;
  generationId?: string | PopulatedRef | null;
  /** Populated parent model (from GET /variants/:id) */
  model?: PopulatedRef;
  /** Populated generation (from GET /variants/:id) */
  generation?: PopulatedRef | null;
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

/** Safe display name from a string id or populated `{ name }` object */
export const refName = (value: unknown, fallback = '—'): string => {
  if (!value) return fallback;
  if (typeof value === 'string') return fallback;
  if (typeof value === 'object' && value !== null && 'name' in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === 'string' && name.trim() ? name : fallback;
  }
  return fallback;
};

export const brandNameFromVariant = (variant?: Variant | null): string => {
  if (!variant) return '—';
  const fromModel = variant.model?.brandId;
  const fromModelId = typeof variant.modelId === 'object' ? variant.modelId?.brandId : undefined;
  return refName(fromModel, '') || refName(fromModelId, '') || '—';
};

export const modelNameFromVariant = (variant?: Variant | null): string => {
  if (!variant) return '—';
  return refName(variant.model, '') || refName(variant.modelId, '') || '—';
};

export const generationNameFromVariant = (variant?: Variant | null): string => {
  if (!variant) return '—';
  return refName(variant.generation, '') || refName(variant.generationId, '') || '—';
};

export const getVariants = async (params?: Record<string, any>): Promise<PaginatedResponse<Variant>> => {
  const response = await api.get('/variants', { params });
  return response.data;
};

export const getVariant = async (id: string): Promise<SingleResponse<Variant>> => {
  const response = await api.get(`/variants/${id}`);
  return response.data;
};

export const getVariantBySlug = async (slug: string): Promise<SingleResponse<Variant> | null> => {
  try {
    const response = await api.get(`/variants/slug/${slug}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
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
