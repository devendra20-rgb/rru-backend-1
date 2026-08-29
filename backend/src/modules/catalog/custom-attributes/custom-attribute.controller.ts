import { Request, Response, NextFunction } from 'express';
import { CustomAttributeService } from './custom-attribute.service';

export class CustomAttributeController {
  static async getCustomAttributes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomAttributeService.getCustomAttributes({
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string,
        appliesTo: req.query.appliesTo as string,
        isActive: req.query.isActive as string,
        type: req.query.type as any,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomAttributeById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomAttributeService.getCustomAttributeById(req.params.id as string);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createCustomAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomAttributeService.createCustomAttribute(req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomAttributeService.updateCustomAttribute(req.params.id as string, req.body);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomAttribute(req: Request, res: Response, next: NextFunction) {
    try {
      await CustomAttributeService.deleteCustomAttribute(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
