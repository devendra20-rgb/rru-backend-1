import { Types } from 'mongoose';
import { Article } from './article.model';
import { IArticle, GetArticlesQuery, CreateArticleInput, UpdateArticleInput } from './article.types';

export class ArticleRepository {
  async create(data: CreateArticleInput): Promise<IArticle> {
    const article = new Article(data);
    return article.save();
  }

  async findById(id: string): Promise<IArticle | null> {
    return Article.findById(id).populate('authorId', 'username').populate('featuredImage', 'url altText mediaType').exec();
  }

  async findBySlug(slug: string, status?: string): Promise<IArticle | null> {
    const filter: Record<string, any> = { slug };
    if (status) filter.status = status;
    return Article.findOne(filter).populate('authorId', 'username').populate('featuredImage', 'url altText mediaType').exec();
  }

  async update(id: string, data: UpdateArticleInput): Promise<IArticle | null> {
    return Article.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<IArticle | null> {
    return Article.findByIdAndDelete(id).exec();
  }

  async findMany(query: GetArticlesQuery & { isAdmin?: boolean }): Promise<{ data: IArticle[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      search,
      category,
      status,
      isAdmin = false,
    } = query;

    const filter: Record<string, any> = {};
    
    // Non-admins can only see published articles
    if (!isAdmin) {
      filter.status = 'published';
    } else if (status) {
      filter.status = status;
    }

    if (category) filter.category = category;

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    
    // Sort logic
    let sortObj: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    if (search) {
      // If text search, order by relevance first
      sortObj = { score: { $meta: 'textScore' }, ...sortObj };
    }

    const [data, total] = await Promise.all([
      Article.find(filter, search ? { score: { $meta: 'textScore' } } : {})
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'username')
        .populate('featuredImage', 'url altText mediaType')
        .exec(),
      Article.countDocuments(filter),
    ]);

    return { data, total };
  }
}
