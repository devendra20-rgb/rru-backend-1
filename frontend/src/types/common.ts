// Common / shared types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string>;
}

export interface Market {
  _id: string;
  marketCode: string;
  countryCode: string;
  name: string;
  currencyCode: string;
  locale: string;
  timezone: string;
  isActive: boolean;
}

export interface Dealer {
  _id: string;
  name: string;
  slug: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  isVerified: boolean;
  location?: string;
  city?: string;
  rating?: number;
  responseTime?: string;
  listingsCount?: number;
  logoUrl?: string;
  brands?: string[];
}

export interface Poll {
  _id: string;
  title: string;
  optionA: {
    label: string;
    votes: number;
    vehicleSlug?: string;
  };
  optionB: {
    label: string;
    votes: number;
    vehicleSlug?: string;
  };
  totalVotes: number;
  isActive: boolean;
}
