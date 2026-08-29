import { Document, Types } from 'mongoose';

export type CustomAttributeType = 'text' | 'number' | 'boolean' | 'select';

export interface ICustomAttribute extends Document {
  _id: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface GetCustomAttributesQuery {
  page?: number;
  limit?: number;
  search?: string;
  appliesTo?: string;
  isActive?: string;
  type?: CustomAttributeType;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
