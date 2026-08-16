import { Schema, model } from 'mongoose';
import { IVariantMarket } from './variant-market.types';

const pricingSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currencyCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    priceType: {
      type: String,
      required: true,
      enum: ['starting', 'ex_showroom', 'on_road', 'msrp', 'other'],
    },
  },
  { _id: false },
);

const variantMarketSchema = new Schema<IVariantMarket>(
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
    availabilityStatus: {
      type: String,
      enum: ['available', 'unavailable', 'upcoming', 'discontinued'],
      default: 'upcoming',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    launchDate: {
      type: Date,
    },
    discontinuedDate: {
      type: Date,
    },
    pricing: {
      type: pricingSchema,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
variantMarketSchema.index({ variantId: 1, marketId: 1 }, { unique: true });
variantMarketSchema.index({ variantId: 1 });
variantMarketSchema.index({ marketId: 1 });
variantMarketSchema.index({ availabilityStatus: 1 });
variantMarketSchema.index({ status: 1 });
variantMarketSchema.index({ isFeatured: 1, marketId: 1 });
variantMarketSchema.index({ 'pricing.priceType': 1 });

export const VariantMarket = model<IVariantMarket>('VariantMarket', variantMarketSchema);
