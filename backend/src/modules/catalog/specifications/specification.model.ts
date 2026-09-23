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
      adas: { type: Boolean },
      parkingSensors: { type: String, trim: true },
      camera: { type: String, trim: true },
    },
    electric: {
      batteryCapacity: { type: Number },
      usableBatteryCapacity: { type: Number },
      motorType: { type: String, trim: true },
      motorConfiguration: { type: String, trim: true },
      wltpRange: { type: Number },
      drivingRange: { type: Number },
      cityRange: { type: Number },
      highwayRange: { type: Number },
      batteryVoltage: { type: Number },
      acChargingPower: { type: Number },
      dcChargingPower: { type: Number },
      acChargingTime: { type: Number },
      dcChargingTime: { type: Number },
      chargingPort: { type: String, trim: true },
      chargingTime10To80: { type: Number },
      energyConsumption: { type: Number },
      regenerativeBraking: { type: Boolean },
      onboardCharger: { type: String, trim: true },
      vehicleToLoad: { type: Boolean },
      vehicleToGrid: { type: Boolean },
      heatPump: { type: Boolean },
    },
    customAttributes: {
      type: Schema.Types.Mixed,
      default: {},
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

specificationSchema.index({ status: 1 });

export const Specification = model<ISpecification>('Specification', specificationSchema);
