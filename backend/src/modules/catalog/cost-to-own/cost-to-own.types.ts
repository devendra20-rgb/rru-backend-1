import { Types } from 'mongoose';
import { PaginationQuery } from '../../../utils/pagination';

export interface ICostToOwn {
  _id?: Types.ObjectId;
  variantId: Types.ObjectId;
  marketId: Types.ObjectId;
  fuelCostAssumptions?: number;
  insurance?: number;
  registration?: number;
  maintenance?: number;
  service?: number;
  depreciation?: number;
  otherOwnershipCosts?: number;
  ownershipPeriod?: number; // e.g. months or years
  totalEstimatedCost?: number;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCostToOwnInput extends Omit<
  ICostToOwn,
  '_id' | 'createdAt' | 'updatedAt' | 'status'
> {
  status?: 'active' | 'inactive';
}

export type UpdateCostToOwnInput = Partial<CreateCostToOwnInput>;

export interface CostToOwnQuery extends PaginationQuery {
  variantId?: string;
  marketId?: string;
  status?: 'active' | 'inactive';
}
