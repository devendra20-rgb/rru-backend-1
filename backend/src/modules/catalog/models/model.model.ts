import { Schema, model } from 'mongoose';
import { IModel } from './model.types';

const modelSchema = new Schema<IModel>(
  {
    brandId: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    modelCode: {
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
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    bodyType: {
      type: String,
    },
    segment: {
      type: String,
    },
    launchYear: {
      type: Number,
    },
    description: {
      type: String,
    },
    shortDescription: {
      type: String,
    },
    seo: {
      title: String,
      description: String,
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
modelSchema.index({ brandId: 1 });
modelSchema.index(
  { brandId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
); // Compound unique name per brand

export const VehicleModel = model<IModel>('Model', modelSchema);
