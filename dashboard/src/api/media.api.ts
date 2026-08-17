import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface Media {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
}

export const getMedia = async (params?: Record<string, any>): Promise<PaginatedResponse<Media>> => {
  const response = await api.get('/media', { params });
  const rawData = response.data;

  // Normalize backend response { data: { media: [], pagination: {} } }
  // to match frontend PaginatedResponse { data: [], meta: {} }
  if (rawData?.data && Array.isArray(rawData.data.media)) {
    return {
      success: rawData.success,
      message: rawData.message,
      data: rawData.data.media,
      meta: rawData.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  }

  // Fallback for standard paginated response or empty state
  return {
    success: rawData?.success || false,
    message: rawData?.message || '',
    data: Array.isArray(rawData?.data) ? rawData.data : [],
    meta: rawData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
  };
};

export const getSingleMedia = async (id: string): Promise<SingleResponse<Media>> => {
  const response = await api.get(`/media/${id}`);
  return response.data;
};

export const uploadMedia = async (
  file: File, 
  data?: { folder?: string; entityType?: string; entityId?: string; isPrimary?: boolean; altText?: string; sortOrder?: number }
): Promise<SingleResponse<Media>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
  }

  const response = await api.post('/media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getVariantMedia = async (variantId: string): Promise<SingleResponse<Media[]>> => {
  const response = await api.get(`/variants/${variantId}/media`);
  return response.data;
};

export const updateMedia = async (id: string, data: Partial<Media>): Promise<SingleResponse<Media>> => {
  const response = await api.patch(`/media/${id}`, data);
  return response.data;
};


export const deleteMedia = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/media/${id}`);
  return response.data;
};
