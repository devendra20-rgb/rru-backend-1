import api from '../lib/axios';
import type { SingleResponse } from './brands.api';

export interface Performance {
  topSpeedKph?: number;
  acceleration0To100Kph?: number;
}

export interface Dimensions {
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  wheelbaseMm?: number;
  groundClearanceMm?: number;
}

export interface Capacity {
  bootSpaceLitres?: number;
  fuelTankLitres?: number;
}

export interface Weight {
  kerbWeightKg?: number;
  grossWeightKg?: number;
}

export interface Fuel {
  fuelEconomyCity?: number;
  fuelEconomyHighway?: number;
  fuelEconomyCombined?: number;
  economyUnit?: string;
}

export interface Safety {
  airbags?: number;
  abs?: boolean;
  tractionControl?: boolean;
  stabilityControl?: boolean;
  adas?: boolean;
  parkingSensors?: string;
  camera?: string;
}

export interface ElectricSpecification {
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

export interface Specification {
  _id: string;
  variantId: string | any;
  performance?: Performance;
  dimensions?: Dimensions;
  capacity?: Capacity;
  weight?: Weight;
  fuel?: Fuel;
  safety?: Safety;
  electric?: ElectricSpecification;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Fetch specifications for a particular variant
export const getVariantSpecifications = async (variantId: string): Promise<SingleResponse<Specification | null>> => {
  const response = await api.get(`/specifications/variant/${variantId}`);
  return response.data;
};

// Create or Update specification for a variant
// Note: We'll POST to /variants/:variantId/specifications or PATCH /specifications/:id depending on if it exists
export const createVariantSpecification = async (variantId: string, data: Partial<Specification>): Promise<SingleResponse<Specification>> => {
  const response = await api.post(`/specifications`, { ...data, variantId });
  return response.data;
};

export const updateSpecification = async (id: string, data: Partial<Specification>): Promise<SingleResponse<Specification>> => {
  const response = await api.patch(`/specifications/${id}`, data);
  return response.data;
};
