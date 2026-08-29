import api from '../lib/axios';
import type { PaginatedResponse, SingleResponse } from './brands.api';

export interface User {
  _id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'editor';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export const getUsers = async (params?: Record<string, any>): Promise<PaginatedResponse<User>> => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUser = async (id: string): Promise<SingleResponse<User>> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: Partial<User>): Promise<SingleResponse<User>> => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<User>): Promise<SingleResponse<User>> => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<SingleResponse<null>> => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
