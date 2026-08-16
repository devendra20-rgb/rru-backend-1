import { Schema, model, Document } from 'mongoose';
import { ICostToOwn } from './cost-to-own.types';

export interface ICostToOwnDocument extends ICostToOwn, Document {
  _id: any;
}

const costToOwnSchema = new Schema<ICostToOwnDocument>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'Variant',
      required: true,
    },
    marketId: {
      type: Schema.Types.ObjectId,
      ref: 'Market',
      required: true,
    },
    fuelCostAssumptions: { type: Number, min: 0 },
    insurance: { type: Number, min: 0 },
    registration: { type: Number, min: 0 },
    maintenance: { type: Number, min: 0 },
    service: { type: Number, min: 0 },
    depreciation: { type: Number, min: 0 },
    otherOwnershipCosts: { type: Number, min: 0 },
    ownershipPeriod: { type: Number, min: 1 },
    totalEstimatedCost: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
costToOwnSchema.index({ variantId: 1, marketId: 1 }, { unique: true });
costToOwnSchema.index({ variantId: 1 });
costToOwnSchema.index({ marketId: 1 });
costToOwnSchema.index({ status: 1 });

export const CostToOwn = model<ICostToOwnDocument>('CostToOwn', costToOwnSchema);
