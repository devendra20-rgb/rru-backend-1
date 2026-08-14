import { Schema, model } from 'mongoose';
import { ISpecification } from './specification.types';

const specificationSchema = new Schema<ISpecification>(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: 'Variant',
      required: true,
      unique: true,
    },
    performance: {
      topSpeedKph: { type: Number },
      acceleration0To100Kph: { type: Number },
    },
    dimensions: {
      lengthMm: { type: Number },
      widthMm: { type: Number },
      heightMm: { type: Number },
      wheelbaseMm: { type: Number },
      groundClearanceMm: { type: Number },
    },
    capacity: {
      bootSpaceLitres: { type: Number },
      fuelTankLitres: { type: Number },
    },
    weight: {
      kerbWeightKg: { type: Number },
      grossWeightKg: { type: Number },
    },
    fuel: {
      fuelEconomyCity: { type: Number },
      fuelEconomyHighway: { type: Number },
      fuelEconomyCombined: { type: Number },
      economyUnit: { type: String, trim: true },
    },
    safety: {
      airbags: { type: Number },
      abs: { type: Boolean },
      tractionControl: { type: Boolean },
      stabilityControl: { type: Boolean },
      parkingSensors: { type: String, trim: true },
      camera: { type: String, trim: true },
    },
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
specificationSchema.index({ variantId: 1 });
specificationSchema.index({ status: 1 });

export const Specification = model<ISpecification>('Specification', specificationSchema);
