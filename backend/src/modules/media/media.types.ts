import { Document, Types } from 'mongoose';
import { PaginationQuery } from '../../utils/pagination';

export interface IMedia extends Document {
  _id: Types.ObjectId;
  entityType: 'variant'; // Only 'variant' initially supported
  entityId: Types.ObjectId;
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
  entityType: 'variant';
  entityId: string;
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
  mediaType?: string;
  status?: string;
  isPrimary?: boolean | string;
}
