import { Request, Response, NextFunction } from 'express';
import { ArticleService } from './article.service';
import { GetArticlesQuery, CreateArticleInput, UpdateArticleInput } from './article.types';
import { sendSuccess } from '../../utils/response';

export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  getArticles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as GetArticlesQuery;
      // Allow editors/admins to see draft/archived articles
      const isAdmin = req.user && ['admin', 'editor'].includes(req.user.role);
      
      const { data, total } = await this.articleService.getArticles(query, !!isAdmin);

      sendSuccess(res, 200, 'Articles retrieved', data, {
        page: query.page || 1,
        limit: query.limit || 10,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  getArticleBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isAdmin = req.user && ['admin', 'editor'].includes(req.user.role);
      const article = await this.articleService.getArticleBySlug(req.params.slug as string, !!isAdmin);
      
      sendSuccess(res, 200, 'Article retrieved', article);
    } catch (error) {
      next(error);
    }
  };
  
  getArticleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await this.articleService.getArticleById(req.params.id as string);
      
      sendSuccess(res, 200, 'Article retrieved', article);
    } catch (error) {
      next(error);
    }
  };

  createArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: CreateArticleInput = req.body;
      const article = await this.articleService.createArticle(data);
      
      sendSuccess(res, 201, 'Article created', article);
    } catch (error) {
      next(error);
    }
  };

  updateArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: UpdateArticleInput = req.body;
      const article = await this.articleService.updateArticle(req.params.id as string, data);
      
      sendSuccess(res, 200, 'Article updated', article);
    } catch (error) {
      next(error);
    }
  };

  deleteArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.articleService.deleteArticle(req.params.id as string);
      
      sendSuccess(res, 200, 'Article deleted');
    } catch (error) {
      next(error);
    }
  };
}
