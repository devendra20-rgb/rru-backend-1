import { api, USE_MOCK } from '@/lib/api';
import { vehiclesMock } from '@/data/vehicles.mock';
import type { Vehicle, VehicleFilters } from '@/types/vehicle';

export const vehiclesService = {
  getAll: async (filters?: VehicleFilters): Promise<Vehicle[]> => {
    if (USE_MOCK) return vehiclesMock;
    const res = await api.get<{ data: Vehicle[] }>('/api/v1/vehicles', filters as Record<string, string | number | boolean | undefined>);
    return res.data;
  },

  getBySlug: async (slug: string): Promise<Vehicle | undefined> => {
    if (USE_MOCK) return vehiclesMock.find((v) => v.slug === slug);
    const res = await api.get<{ data: Vehicle }>(`/api/v1/vehicles/slug/${slug}`);
    return res.data;
  },
};
