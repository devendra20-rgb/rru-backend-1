import api from '../lib/axios';

export type CustomAttributeType = 'text' | 'number' | 'boolean' | 'select';

export interface CustomAttribute {
  _id: string;
  name: string;
  key: string;
  type: CustomAttributeType;
  unit?: string;
  description?: string;
  appliesTo: string;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  options?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetCustomAttributesParams {
  page?: number;
  limit?: number;
  search?: string;
  appliesTo?: string;
  isActive?: boolean;
  type?: CustomAttributeType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomAttributesResponse {
  data: CustomAttribute[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const customAttributesApi = {
  getAll: async (params?: GetCustomAttributesParams) => {
    const response = await api.get<CustomAttributesResponse>('/custom-attributes', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ data: CustomAttribute }>(`/custom-attributes/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<CustomAttribute>) => {
    const response = await api.post<{ data: CustomAttribute }>('/custom-attributes', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CustomAttribute>) => {
    const response = await api.patch<{ data: CustomAttribute }>(`/custom-attributes/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/custom-attributes/${id}`);
  },
};
