import { Schema, model } from 'mongoose';
import { IFeature, IVariantFeature } from './feature.types';

// Feature Schema
const featureSchema = new Schema<IFeature>(
  {
    name: {
      type: String,
      required: [true, 'Feature name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'safety',
          'exterior',
          'interior',
          'comfort',
          'infotainment',
          'convenience',
          'performance',
          'other',
        ],
        message: '{VALUE} is not a valid category',
      },
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

featureSchema.index({ slug: 1 }, { unique: true });
featureSchema.index({ category: 1 });
featureSchema.index({ status: 1 });
featureSchema.index({ name: 'text', description: 'text' });

export const Feature = model<IFeature>('Feature', featureSchema);

// VariantFeature Schema
const variantFeatureSchema = new Schema<IVariantFeature>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'Variant',
      required: [true, 'Variant ID is required'],
    },
    featureId: {
      type: Schema.Types.ObjectId,
      ref: 'Feature',
      required: [true, 'Feature ID is required'],
    },
    availability: {
      type: String,
      required: [true, 'Availability is required'],
      enum: {
        values: ['standard', 'optional', 'unavailable'],
        message: '{VALUE} is not a valid availability status',
      },
    },
    value: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

variantFeatureSchema.index({ variantId: 1 });
variantFeatureSchema.index({ featureId: 1 });
variantFeatureSchema.index({ status: 1 });
variantFeatureSchema.index({ variantId: 1, featureId: 1 }, { unique: true });

export const VariantFeature = model<IVariantFeature>('VariantFeature', variantFeatureSchema);
