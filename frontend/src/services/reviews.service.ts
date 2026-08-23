import { api, USE_MOCK } from '@/lib/api';
import { reviewsMock } from '@/data/homepage.mock';
import type { Review } from '@/types/review';

function normalizeReview(raw: any): Review {
  return {
    _id: raw._id,
    vehicleId: raw.variantId?._id || raw.variantId || raw.vehicleId,
    vehicleName: raw.variantId?.name || raw.vehicleName || 'Verified Vehicle',
    authorName: raw.userId?.username || raw.authorName || 'Verified Driver',
    authorLocation: raw.authorLocation || 'Dubai, UAE',
    isVerified: raw.isVerified ?? true,
    rating: raw.rating || 5,
    title: raw.title || 'Great Car',
    content: raw.body || raw.content || '',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export const reviewsService = {
  getAll: async (): Promise<Review[]> => {
    if (USE_MOCK) return reviewsMock;
    const res = await api.get<{ data: any[] }>('/api/v1/reviews');
    return (res.data || []).map(normalizeReview);
  },

  getByVehicleId: async (vehicleId: string): Promise<Review[]> => {
    if (USE_MOCK) return reviewsMock.filter((r) => r.vehicleId === vehicleId || true);
    try {
      const res = await api.get<{ data: any[] }>(`/api/v1/variants/${vehicleId}/reviews`);
      return (res.data || []).map(normalizeReview);
    } catch {
      return [];
    }
  },
};
