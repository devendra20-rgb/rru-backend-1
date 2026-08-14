import { Schema, model } from 'mongoose';
import { IVariant } from './variant.types';

const variantSchema = new Schema<IVariant>(
  {
    generationId: {
      type: Schema.Types.ObjectId,
      ref: 'Generation',
      required: true,
    },
    variantCode: {
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
    description: {
      type: String,
    },
    shortDescription: {
      type: String,
    },
    modelYear: {
      type: Number,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'hybrid', 'plug_in_hybrid', 'electric', 'cng', 'lpg', 'other'],
    },
    transmissionType: {
      type: String,
      enum: ['manual', 'automatic', 'cvt', 'dct', 'amt', 'other'],
    },
    drivetrain: {
      type: String,
      enum: ['fwd', 'rwd', 'awd', '4wd', 'other'],
    },
    engine: {
      displacementCc: { type: Number },
      cylinders: { type: Number },
      aspiration: { type: String },
      powerHp: { type: Number },
      torqueNm: { type: Number },
    },
    seatingCapacity: {
      type: Number,
    },
    doors: {
      type: Number,
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
variantSchema.index({ generationId: 1 });
variantSchema.index(
  { generationId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);
variantSchema.index({ fuelType: 1 });
variantSchema.index({ transmissionType: 1 });
variantSchema.index({ drivetrain: 1 });
variantSchema.index({ status: 1 });

export const Variant = model<IVariant>('Variant', variantSchema);
