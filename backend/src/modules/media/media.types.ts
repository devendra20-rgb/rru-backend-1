import { Document, Types } from 'mongoose';
import { PaginationQuery } from '../../utils/pagination';

export interface IMedia extends Document {
  _id: Types.ObjectId;
  folder?: string;
  entityType?: 'variant' | 'brand' | 'model' | 'generation';
  entityId?: Types.ObjectId;
  colorId?: Types.ObjectId;    // Optional: links image to a specific color variant
  angleTag?: string;           // Optional: e.g. 'exterior-front', 'exterior-rear', 'interior', 'exterior-side', '360-frame'
  mediaType: 'image' | 'video';
  storageProvider: 'local' | 's3';
  storageKey: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaDTO {
  folder?: string;
  entityType?: 'variant' | 'brand' | 'model' | 'generation';
  entityId?: string;
  colorId?: string;            // Optional color association
  angleTag?: string;           // Optional angle tag
  mediaType?: 'image' | 'video';
  altText?: string;
  isPrimary?: boolean | string;
  sortOrder?: number | string;
}

export interface UpdateMediaDTO {
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  status?: 'active' | 'inactive';
}

export interface MediaQuery extends PaginationQuery {
  entityType?: string;
  entityId?: string;
  colorId?: string;
  angleTag?: string;
  mediaType?: string;
  status?: string;
  isPrimary?: boolean | string;
}
