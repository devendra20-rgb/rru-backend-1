import { Types } from 'mongoose';

export interface GetCarsQuery {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  modelId?: string;
  generationId?: string;
  marketId?: string;
  fuelType?: string;
  transmissionType?: string;
  drivetrain?: string;
  modelYear?: number;
  availabilityStatus?: string;
  isFeatured?: boolean;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CarListingCard {
  _id: string;
  name: string;
  slug: string;
  modelYear?: number;
  fuelType?: string;
  transmissionType?: string;
  drivetrain?: string;
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
  model: {
    _id: string;
    name: string;
    slug: string;
  };
  generation: {
    _id: string;
    name: string;
    slug: string;
  };
  primaryMedia?: {
    url: string;
    altText?: string;
  };
  pricing?: {
    amount: number;
    currencyCode: string;
    priceType: string;
  };
  availabilityStatus?: string;
}

export interface CarDetailResponse {
  _id: string;
  name: string;
  slug: string;
  variantCode: string;
  description?: string;
  shortDescription?: string;
  modelYear?: number;
  fuelType?: string;
  transmissionType?: string;
  drivetrain?: string;
  engine?: any;
  seatingCapacity?: number;
  doors?: number;
  brand: {
    _id: string;
    name: string;
    slug: string;
    brandCode: string;
  };
  model: {
    _id: string;
    name: string;
    slug: string;
    bodyType?: string;
    segment?: string;
  };
  generation: {
    _id: string;
    name: string;
    slug: string;
    startYear?: number;
    endYear?: number;
  };
  media: Array<{
    url: string;
    mediaType: string;
    isPrimary: boolean;
    sortOrder: number;
    altText?: string;
  }>;
  markets: Array<{
    market: {
      _id: string;
      name: string;
      code: string;
      currencyCode: string;
    };
    availabilityStatus: string;
    pricing?: {
      amount: number;
      currencyCode: string;
      priceType: string;
    };
    launchDate?: string;
  }>;
  specifications?: any;
  features: Array<{
    category: string;
    name: string;
    availability: string;
    value?: string;
  }>;
  colors: Array<{
    name: string;
    hexCode: string;
    type: string;
    availability: string;
  }>;
}
