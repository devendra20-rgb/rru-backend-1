import { Document, Types } from 'mongoose';
import { PaginationQuery } from '../../../utils/pagination';

// Enums
export type ColorType = 'exterior' | 'interior';
export type ColorStatus = 'active' | 'inactive';

export type VariantColorAvailability = 'standard' | 'optional' | 'unavailable';
export type VariantColorStatus = 'active' | 'inactive';

// Color Interface
export interface IColor extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  hexCode?: string;
  type: ColorType;
  status: ColorStatus;
  createdAt: Date;
  updatedAt: Date;
}

// VariantColor Interface
export interface IVariantColor extends Document {
  _id: Types.ObjectId;
  variantId: Types.ObjectId;
  colorId: Types.ObjectId;
  availability: VariantColorAvailability;
  status: VariantColorStatus;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
export interface CreateColorDTO {
  name: string;
  hexCode?: string;
  type: ColorType;
  status?: ColorStatus;
}

export interface UpdateColorDTO {
  name?: string;
  hexCode?: string;
  type?: ColorType;
  status?: ColorStatus;
}

export interface CreateVariantColorDTO {
  variantId: string;
  colorId: string;
  availability: VariantColorAvailability;
  status?: VariantColorStatus;
}

export interface UpdateVariantColorDTO {
  availability?: VariantColorAvailability;
  status?: VariantColorStatus;
}

export interface ColorQuery extends PaginationQuery {
  type?: ColorType;
  status?: ColorStatus;
  search?: string;
}

export interface VariantColorQuery extends PaginationQuery {
  variantId?: string;
  colorId?: string;
  availability?: VariantColorAvailability;
  status?: VariantColorStatus;
}
