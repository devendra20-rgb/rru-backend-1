// Vehicle / Variant types
export interface VehicleMedia {
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  mediaType?: 'image' | 'video';
  colorId?: string;   // which color this image belongs to (null = any color)
  angleTag?: string;  // e.g. 'exterior-front', 'interior', 'detail'
}
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
  images?: string[];       // flat list of URLs (backward compat)
  mediaItems?: VehicleMedia[];  // rich media objects with colorId, angleTag
  tags?: string[];
  badges?: VehicleBadge[];
  isVerified?: boolean;
  isGccSpec?: boolean;
  isBelowMarket?: boolean;
  status?: 'active' | 'inactive' | 'upcoming';
  colors?: VehicleColor[];
  features?: VehicleFeature[];
  specifications?: VehicleSpecifications;
  // Used car specific
  kilometres?: number;
  owners?: number;
  warranty?: string;
  dealerName?: string;
  dealerSlug?: string;
}

export interface VehicleColor {
  _id?: string;    // Color document ID, used to match color-specific media
  name: string;
  hexCode?: string;
  type?: 'exterior' | 'interior';
  availability?: string;
}

export interface VehicleFeature {
  category: string;
  name: string;
  availability?: string;
  value?: string;
}

export interface VehicleSpecifications {
  performance?: { topSpeedKph?: number; acceleration0To100Kph?: number };
  dimensions?: { lengthMm?: number; widthMm?: number; heightMm?: number; wheelbaseMm?: number };
  capacity?: { bootSpaceLitres?: number; fuelTankLitres?: number };
  weight?: { kerbWeightKg?: number };
  fuel?: { fuelEconomyCombined?: number; fuelEconomyCity?: number; fuelEconomyHighway?: number; economyUnit?: string };
  safety?: { airbags?: number; abs?: boolean; tractionControl?: boolean; stabilityControl?: boolean };
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
