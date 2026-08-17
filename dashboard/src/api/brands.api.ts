import api from '../lib/axios';

export interface Brand {
  _id: string;
  brandCode: string;
  name: string;
  slug: string;
  originCountryCode?: string;
  websiteUrl?: string;
  logoMediaId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getBrands = async (params?: Record<string, any>): Promise<PaginatedResponse<Brand>> => {
  const response = await api.get('/brands', { params });
  return response.data;
};

export const getBrand = async (id: string): Promise<SingleResponse<Brand>> => {
  const response = await api.get(`/brands/${id}`);
  return response.data;
};

export const createBrand = async (data: Partial<Brand>): Promise<SingleResponse<Brand>> => {
  const response = await api.post('/brands', data);
  return response.data;
};

export const updateBrand = async (id: string, data: Partial<Brand>): Promise<SingleResponse<Brand>> => {
  const response = await api.patch(`/brands/${id}`, data);
  return response.data;
};

export const deleteBrand = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/brands/${id}`);
  return response.data;
};
