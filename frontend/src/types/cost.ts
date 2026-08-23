// Cost to Own types
export interface CostToOwnInput {
  variantId?: string;
  vehiclePrice?: number;
  market?: string;
  annualKm?: number;
  annualMileageKm?: number;
  ownershipYears?: number;
  fuelPrice?: number;
  fuelType?: string;
  isFinanced?: boolean;
}

export interface CostToOwnBreakdown {
  vehicleName: string;
  market: string;
  annualKm: number;
  ownershipYears: number;
  isFinanced: boolean;
  monthly: {
    financeDepreciation: number;
    insurance: number;
    fuel: number;
    servicing: number;
    tyres: number;
    registration: number;
    tolls: number;
    total: number;
  };
  totalOverPeriod: number;
  hiddenCosts: {
    registrationTransfer: number;
    insuranceYear1: number;
    numberPlate: number;
    bankProcessing?: number;
    inspection?: number;
    total: number;
  };
  assumptions: {
    fuelPrice: number;
    fuelPriceDate: string;
    insuranceNote: string;
    depreciationNote: string;
  };
}

export interface SegmentComparison {
  vehicleName: string;
  totalCost3Year?: number;
  costPerMonth: number;
  isCurrentVehicle?: boolean;
}
