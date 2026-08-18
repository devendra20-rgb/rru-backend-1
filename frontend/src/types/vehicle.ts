// Vehicle / Variant types
export interface Vehicle {
  _id: string;
  brand: string;
  brandSlug: string;
  model: string;
  modelSlug: string;
  variant: string;
  slug: string;
  year: number;
  bodyType: string;
  fuelType: string;
  transmission: string;
  drivetrain?: string;
  seats: number;
  doors?: number;
  engine?: {
    displacement?: string;
    type?: string;
    cylinders?: number;
    power?: string;
    torque?: string;
  };
  performance?: {
    topSpeed?: number;
    acceleration0To100?: number;
  };
  fuelConsumption?: {
    combined?: number;
    city?: number;
    highway?: number;
    unit?: string;
  };
  priceFrom?: number;
  priceTo?: number;
  currency?: string;
  costToOwnMonthly?: number;
  imageUrl?: string;
  images?: string[];
  tags?: string[];
  badges?: VehicleBadge[];
  isVerified?: boolean;
  isGccSpec?: boolean;
  isBelowMarket?: boolean;
  status: 'active' | 'inactive' | 'upcoming';
  // Used car specific
  kilometres?: number;
  owners?: number;
  warranty?: string;
  dealerName?: string;
  dealerSlug?: string;
}

export interface VehicleBadge {
  label: string;
  type: 'success' | 'warning' | 'info' | 'amber';
}

export interface VehicleFilters {
  market?: string;
  brand?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  seats?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
