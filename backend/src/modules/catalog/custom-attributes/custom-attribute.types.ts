import { Document } from 'mongoose';

export type CustomAttributeType = 'text' | 'number' | 'boolean' | 'select' | 'multi-select';
export type CustomAttributeAppliesTo = 'vehicle' | 'variant' | 'all';
export type CustomAttributeStatus = 'active' | 'inactive';

export interface ICustomAttribute extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomAttributeCreate {
  name: string;
  key: string;
  type: CustomAttributeType;
  unit?: string;
  description?: string;
  appliesTo?: CustomAttributeAppliesTo;
  isRequired?: boolean;
  status?: CustomAttributeStatus;
  sortOrder?: number;
  options?: string[];
}

export interface ICustomAttributeUpdate {
  name?: string;
  key?: string;
  type?: CustomAttributeType;
  unit?: string;
  description?: string;
  appliesTo?: CustomAttributeAppliesTo;
  isRequired?: boolean;
  status?: CustomAttributeStatus;
  sortOrder?: number;
  options?: string[];
}

export interface ICustomAttributeQuery {
  search?: string;
  status?: CustomAttributeStatus;
  appliesTo?: CustomAttributeAppliesTo;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
