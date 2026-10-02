import { api, USE_MOCK } from '@/lib/api';
import { brandsMock } from '@/data/brands.mock';
import type { Brand } from '@/types/brand';

export const brandsService = {
  getAll: async (): Promise<Brand[]> => {
    if (USE_MOCK) return brandsMock;
    // Request all active brands from the catalog without artificial 100 limit restriction
    const res = await api.get<{ data: Brand[] }>('/api/v1/brands', { limit: 1000, status: 'active' });
    return res.data || [];
  },

  getBySlug: async (slug: string): Promise<Brand | undefined> => {
    if (USE_MOCK) return brandsMock.find((b) => b.slug === slug);
    try {
      const res = await api.get<{ data: Brand }>(`/api/v1/brands/slug/${slug}`);
      return res.data;
    } catch {
      return undefined;
    }
  },
};
