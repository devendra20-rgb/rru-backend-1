import { api, USE_MOCK } from '@/lib/api';
import { reviewsMock } from '@/data/homepage.mock';
import type { Review } from '@/types/review';

export const reviewsService = {
  getAll: async (): Promise<Review[]> => {
    if (USE_MOCK) return reviewsMock;
    const res = await api.get<{ data: Review[] }>('/api/v1/reviews');
    return res.data;
  },

  getByVehicleId: async (vehicleId: string): Promise<Review[]> => {
    if (USE_MOCK) return reviewsMock.filter((r) => r.vehicleId === vehicleId || true);
    const res = await api.get<{ data: Review[] }>(`/api/v1/reviews/vehicle/${vehicleId}`);
    return res.data;
  },
};
