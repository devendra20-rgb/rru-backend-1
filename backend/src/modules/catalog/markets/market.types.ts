import { Document } from 'mongoose';
import { PaginationQuery } from '../../../utils/pagination';

export interface IMarket extends Document {
  code: string;
  name: string;
  countryCode: string;
  currencyCode: string;
  currencySymbol?: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface IMarketCreate {
  code: string;
  name: string;
  countryCode: string;
  currencyCode: string;
  currencySymbol?: string;
  status?: 'active' | 'inactive' | 'draft';
}

export type IMarketUpdate = Partial<IMarketCreate>;

export interface IMarketQuery {
  search?: string;
  status?: string;
  countryCode?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
