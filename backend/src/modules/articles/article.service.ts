import { ArticleRepository } from './article.repository';
import { GetArticlesQuery, CreateArticleInput, UpdateArticleInput, IArticle } from './article.types';
import { AppError } from '../../middlewares/error.middleware';

export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

  async getArticles(query: GetArticlesQuery, isAdmin: boolean = false): Promise<{ data: IArticle[]; total: number }> {
    return this.articleRepository.findMany({ ...query, isAdmin });
  }

  async getArticleBySlug(slug: string, isAdmin: boolean = false): Promise<IArticle> {
    const status = isAdmin ? undefined : 'published';
    const article = await this.articleRepository.findBySlug(slug, status);
    
    if (!article) {
      throw new AppError('Article not found', 404);
    }
    
    return article;
  }

  async getArticleById(id: string): Promise<IArticle> {
    const article = await this.articleRepository.findById(id);
    
    if (!article) {
      throw new AppError('Article not found', 404);
    }
    
    return article;
  }

  async createArticle(data: CreateArticleInput): Promise<IArticle> {
    if (!data.slug && data.title) {
      data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const existing = await this.articleRepository.findBySlug(data.slug);
    if (existing) {
      throw new AppError('Article with this slug already exists', 409);
    }

    if (data.status === 'published' && !data.publishedAt) {
      data.publishedAt = new Date().toISOString();
    }

    return this.articleRepository.create(data);
  }

  async updateArticle(id: string, data: UpdateArticleInput): Promise<IArticle> {
    const article = await this.getArticleById(id);

    if (data.slug && data.slug !== article.slug) {
      const existing = await this.articleRepository.findBySlug(data.slug);
      if (existing) {
        throw new AppError('Article with this slug already exists', 409);
      }
    }

    if (data.status === 'published' && article.status !== 'published' && !data.publishedAt && !article.publishedAt) {
      data.publishedAt = new Date().toISOString();
    }

    const updated = await this.articleRepository.update(id, data);
    if (!updated) {
      throw new AppError('Article not found', 404);
    }

    return updated;
  }

  async deleteArticle(id: string): Promise<void> {
    const article = await this.articleRepository.delete(id);
    if (!article) {
      throw new AppError('Article not found', 404);
    }
  }
}
