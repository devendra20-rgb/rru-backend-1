import { Schema, model } from 'mongoose';
import { IMarket } from './market.types';

const marketSchema = new Schema<IMarket>(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    currencyCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    currencySymbol: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
marketSchema.index({ countryCode: 1 });
marketSchema.index({ status: 1 });

export const Market = model<IMarket>('Market', marketSchema);
