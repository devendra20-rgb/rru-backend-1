// Review types
export interface Review {
  _id: string;
  vehicleId?: string;
  vehicleName: string;
  authorName: string;
  authorLocation?: string;
  isVerified: boolean;
  rating: number;
  title: string;
  content: string;
  ratings?: {
    comfort?: number;
    reliability?: number;
    performance?: number;
    fuelEconomy?: number;
    features?: number;
    value?: number;
  };
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}
