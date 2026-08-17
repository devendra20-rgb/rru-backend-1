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
  parkingSensors?: string;
  camera?: string;
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
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Fetch specifications for a particular variant
export const getVariantSpecifications = async (variantId: string): Promise<SingleResponse<Specification | null>> => {
  try {
    const response = await api.get(`/specifications/variant/${variantId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { success: true, message: 'Specification not found', data: null };
    }
    throw error;
  }
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
