import { Document } from 'mongoose';

export interface IPerformance {
  topSpeedKph?: number;
  acceleration0To100Kph?: number;
}

export interface IDimensions {
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  groundClearanceMm?: number;
}

export interface ICapacity {
  bootSpaceLitres?: number;
  fuelTankLitres?: number;
}

export interface IWeight {
  kerbWeightKg?: number;
  grossWeightKg?: number;
}

export interface IFuel {
  fuelEconomyCity?: number;
  fuelEconomyHighway?: number;
  fuelEconomyCombined?: number;
  economyUnit?: string;
}

export interface ISafety {
  airbags?: number;
  abs?: boolean;
  tractionControl?: boolean;
  stabilityControl?: boolean;
  adas?: boolean;
  parkingSensors?: string;
  camera?: string;
}

export interface IElectricSpecification {
  batteryCapacity?: number;
  usableBatteryCapacity?: number;
  motorType?: string;
  motorConfiguration?: string;
  wltpRange?: number;
  drivingRange?: number;
  cityRange?: number;
  highwayRange?: number;
  batteryVoltage?: number;
  acChargingPower?: number;
  dcChargingPower?: number;
  acChargingTime?: number;
  dcChargingTime?: number;
  chargingPort?: string;
  chargingTime10To80?: number;
  energyConsumption?: number;
  regenerativeBraking?: boolean;
  onboardCharger?: string;
  vehicleToLoad?: boolean;
  vehicleToGrid?: boolean;
  heatPump?: boolean;
}

export interface ISpecification extends Document {
  variantId: string | any; // Mongoose ObjectId
  performance?: IPerformance;
  dimensions?: IDimensions;
  capacity?: ICapacity;
  weight?: IWeight;
  fuel?: IFuel;
  safety?: ISafety;
  electric?: IElectricSpecification;
  customAttributes?: Record<string, any>;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISpecificationCreate {
  variantId: string;
  performance?: IPerformance;
  dimensions?: IDimensions;
  capacity?: ICapacity;
  weight?: IWeight;
  fuel?: IFuel;
  safety?: ISafety;
  electric?: IElectricSpecification;
  customAttributes?: Record<string, any>;
  status?: 'active' | 'inactive';
}

export interface ISpecificationUpdate {
  performance?: IPerformance;
  dimensions?: IDimensions;
  capacity?: ICapacity;
  weight?: IWeight;
  fuel?: IFuel;
  safety?: ISafety;
  electric?: IElectricSpecification;
  customAttributes?: Record<string, any>;
  status?: 'active' | 'inactive';
}

export interface ISpecificationQuery {
  variantId?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
