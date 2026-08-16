import { Types, Document } from 'mongoose';
import { PaginationQuery } from '../../../utils/pagination';

export interface IPricing {
  amount: number;
  currencyCode: string;
  priceType: 'starting' | 'ex_showroom' | 'on_road' | 'msrp' | 'other';
}

export interface IVariantMarket extends Document {
  variantId: Types.ObjectId;
  marketId: Types.ObjectId;
  availabilityStatus: 'available' | 'unavailable' | 'upcoming' | 'discontinued';
  status: 'active' | 'inactive';
  isFeatured: boolean;
  launchDate?: Date;
  discontinuedDate?: Date;
  pricing?: IPricing;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVariantMarketCreate {
  variantId: string | Types.ObjectId;
  marketId: string | Types.ObjectId;
  availabilityStatus?: 'available' | 'unavailable' | 'upcoming' | 'discontinued';
  status?: 'active' | 'inactive';
  isFeatured?: boolean;
  launchDate?: Date | string;
  discontinuedDate?: Date | string;
  pricing?: IPricing;
}

export type IVariantMarketUpdate = Partial<IVariantMarketCreate>;

export interface IVariantMarketQuery {
  variantId?: string;
  marketId?: string;
  availabilityStatus?: string;
  status?: string;
  priceType?: string;
  isFeatured?: string | boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
