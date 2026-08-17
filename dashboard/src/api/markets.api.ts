import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface Market {
  _id: string;
  code: string;
  name: string;
  countryCode: string;
  currencyCode?: string;
  currencySymbol?: string;
  region?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const getMarkets = async (params?: Record<string, any>): Promise<PaginatedResponse<Market>> => {
  const response = await api.get('/markets', { params });
  return response.data;
};

export const getMarket = async (id: string): Promise<SingleResponse<Market>> => {
  const response = await api.get(`/markets/${id}`);
  return response.data;
};

export const createMarket = async (data: Partial<Market>): Promise<SingleResponse<Market>> => {
  const response = await api.post('/markets', data);
  return response.data;
};

export const updateMarket = async (id: string, data: Partial<Market>): Promise<SingleResponse<Market>> => {
  const response = await api.patch(`/markets/${id}`, data);
  return response.data;
};

export const deleteMarket = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/markets/${id}`);
  return response.data;
};

// Variant Markets Mapping
export interface Pricing {
  amount: number;
  currencyCode: string;
  priceType: 'starting' | 'ex_showroom' | 'on_road' | 'msrp' | 'other';
}

export interface VariantMarket {
  _id: string;
  variantId: string | any;
  marketId: string | any;
  availabilityStatus: 'available' | 'unavailable' | 'upcoming' | 'discontinued';
  status: 'active' | 'inactive';
  isFeatured?: boolean;
  launchDate?: string;
  discontinuedDate?: string;
  pricing?: Pricing;
}

export const getVariantMarkets = async (variantId: string): Promise<PaginatedResponse<VariantMarket>> => {
  const response = await api.get(`/variants/${variantId}/markets`, { params: { limit: 100 } });
  return response.data;
};

export const createVariantMarket = async (variantId: string, data: Partial<VariantMarket>): Promise<SingleResponse<VariantMarket>> => {
  const response = await api.post(`/variants/${variantId}/markets`, data);
  return response.data;
};

export const updateVariantMarket = async (variantId: string, id: string, data: Partial<VariantMarket>): Promise<SingleResponse<VariantMarket>> => {
  const response = await api.patch(`/variants/${variantId}/markets/${id}`, data);
  return response.data;
};

export const deleteVariantMarket = async (variantId: string, id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/variants/${variantId}/markets/${id}`);
  return response.data;
};

