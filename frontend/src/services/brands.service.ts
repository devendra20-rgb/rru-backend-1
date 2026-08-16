import { api, USE_MOCK } from '@/lib/api';
import { brandsMock } from '@/data/brands.mock';
import type { Brand } from '@/types/brand';

export const brandsService = {
  getAll: async (): Promise<Brand[]> => {
    if (USE_MOCK) return brandsMock;
    const res = await api.get<{ data: Brand[] }>('/api/v1/brands');
    return res.data;
  },

  getBySlug: async (slug: string): Promise<Brand | undefined> => {
    if (USE_MOCK) return brandsMock.find((b) => b.slug === slug);
    const res = await api.get<{ data: Brand }>(`/api/v1/brands/slug/${slug}`);
    return res.data;
  },
};
