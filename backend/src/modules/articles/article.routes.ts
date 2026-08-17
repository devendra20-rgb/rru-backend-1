import { Router } from 'express';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleRepository } from './article.repository';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate, authorize, extractUser } from '../../middlewares/auth.middleware';
import {
  createArticleSchema,
  updateArticleSchema,
  getArticlesQuerySchema,
  getArticleBySlugSchema,
  deleteArticleSchema,
  getArticleSchema
} from './article.validation';

const router = Router();
const articleRepository = new ArticleRepository();
const articleService = new ArticleService(articleRepository);
const controller = new ArticleController(articleService);

// Public routes (uses extractUser to see if an admin/editor is logged in to show drafts)
router.get('/', extractUser, validate(getArticlesQuerySchema), controller.getArticles);
router.get('/slug/:slug', extractUser, validate(getArticleBySlugSchema), controller.getArticleBySlug);
router.get('/:id', extractUser, validate(getArticleSchema), controller.getArticleById);

// Protected routes (Admin/Editor)
router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  (req, res, next) => {
    // Automatically set authorId to the logged in user
    if (req.user && !req.body.authorId) {
      req.body.authorId = req.user.userId;
    }
    next();
  },
  validate(createArticleSchema),
  controller.createArticle
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin', 'editor'),
  validate(updateArticleSchema),
  controller.updateArticle
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'editor'),
  validate(deleteArticleSchema),
  controller.deleteArticle
);

export default router;
