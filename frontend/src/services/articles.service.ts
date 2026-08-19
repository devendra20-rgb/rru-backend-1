import { api, USE_MOCK } from '@/lib/api';
import { articlesMock } from '@/data/homepage.mock';
import type { Article } from '@/types/article';

export const articlesService = {
  getAll: async (category?: string): Promise<Article[]> => {
    if (USE_MOCK) {
      return category && category !== 'all'
        ? articlesMock.filter((a) => a.category === category)
        : articlesMock;
    }
    const res = await api.get<{ data: Article[] }>('/api/v1/articles', { category });
    return res.data;
  },

  getBySlug: async (slug: string): Promise<Article | undefined> => {
    if (USE_MOCK) return articlesMock.find((a) => a.slug === slug);
    const res = await api.get<{ data: Article }>(`/api/v1/articles/slug/${slug}`);
    return res.data;
  },
};
