import { Document, Types } from 'mongoose';
import { PaginationQuery } from '../../../utils/pagination';

// Enums
export type FeatureCategory =
  | 'safety'
  | 'exterior'
  | 'interior'
  | 'comfort'
  | 'infotainment'
  | 'convenience'
  | 'performance'
  | 'other';

export type FeatureStatus = 'active' | 'inactive';

export type VariantFeatureAvailability = 'standard' | 'optional' | 'unavailable';
export type VariantFeatureStatus = 'active' | 'inactive';

// Feature Interface
export interface IFeature extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: FeatureCategory;
  description?: string;
  status: FeatureStatus;
  createdAt: Date;
  updatedAt: Date;
}

// VariantFeature Interface
export interface IVariantFeature extends Document {
  _id: Types.ObjectId;
  variantId: Types.ObjectId;
  featureId: Types.ObjectId;
  availability: VariantFeatureAvailability;
  value?: string;
  status: VariantFeatureStatus;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
export interface CreateFeatureDTO {
  name: string;
  category: FeatureCategory;
  description?: string;
  status?: FeatureStatus;
}

export interface UpdateFeatureDTO {
  name?: string;
  category?: FeatureCategory;
  description?: string;
  status?: FeatureStatus;
}

export interface CreateVariantFeatureDTO {
  variantId: string;
  featureId: string;
  availability: VariantFeatureAvailability;
  value?: string;
  status?: VariantFeatureStatus;
}

export interface UpdateVariantFeatureDTO {
  availability?: VariantFeatureAvailability;
  value?: string;
  status?: VariantFeatureStatus;
}

export interface FeatureQuery extends PaginationQuery {
  category?: FeatureCategory;
  status?: FeatureStatus;
  search?: string;
}

export interface VariantFeatureQuery extends PaginationQuery {
  variantId?: string;
  featureId?: string;
  availability?: VariantFeatureAvailability;
  status?: VariantFeatureStatus;
}
