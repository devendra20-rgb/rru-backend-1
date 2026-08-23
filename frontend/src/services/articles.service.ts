import { api, USE_MOCK } from '@/lib/api';
import { articlesMock } from '@/data/homepage.mock';
import type { Article } from '@/types/article';

function normalizeArticle(raw: any): Article {
  return {
    _id: raw._id,
    title: raw.title,
    slug: raw.slug,
    excerpt: raw.excerpt || '',
    content: raw.content || '',
    category: raw.category || 'news',
    imageUrl: raw.featuredImage?.url || raw.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
    author: {
      name: raw.authorId?.username || raw.author?.name || 'RRU Editorial',
      credentials: 'Automotive Journalist',
    },
    readingTime: raw.readingTime || Math.max(3, Math.ceil((raw.content || '').length / 200)),
    publishedAt: raw.publishedAt || raw.createdAt || new Date().toISOString(),
    status: raw.status || 'published',
  };
}

export const articlesService = {
  getAll: async (category?: string): Promise<Article[]> => {
    if (USE_MOCK) {
      return category && category !== 'all'
        ? articlesMock.filter((a) => a.category === category)
        : articlesMock;
    }
    const res = await api.get<{ data: any[] }>('/api/v1/articles', { category: category === 'all' ? undefined : category });
    return (res.data || []).map(normalizeArticle);
  },

  getBySlug: async (slug: string): Promise<Article | undefined> => {
    if (USE_MOCK) return articlesMock.find((a) => a.slug === slug);
    try {
      const res = await api.get<{ data: any }>(`/api/v1/articles/slug/${slug}`);
      return res.data ? normalizeArticle(res.data) : undefined;
    } catch {
      return undefined;
    }
  },
};
