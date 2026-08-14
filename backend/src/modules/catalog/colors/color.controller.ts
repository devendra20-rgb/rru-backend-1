import { Request, Response } from 'express';
import { colorService } from './color.service';
import { sendSuccess } from '../../../utils/response';

export class ColorController {
  // Color handlers
  async createColor(req: Request, res: Response) {
    const color = await colorService.createColor(req.body);
    return sendSuccess(res, 201, 'Color created successfully', color);
  }

  async getColors(req: Request, res: Response) {
    const { data, total } = await colorService.getColors(req.query as unknown as any);
    return sendSuccess(res, 200, 'Colors retrieved successfully', {
      colors: data,
      pagination: {
        total,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        pages: Math.ceil(total / (Number(req.query.limit) || 10)),
      },
    });
  }

  async getColorById(req: Request, res: Response) {
    const color = await colorService.getColorById(req.params.id as string);
    return sendSuccess(res, 200, 'Color retrieved successfully', color);
  }

  async getColorBySlug(req: Request, res: Response) {
    const color = await colorService.getColorBySlug(req.params.slug as string);
    return sendSuccess(res, 200, 'Color retrieved successfully', color);
  }

  async updateColor(req: Request, res: Response) {
    const color = await colorService.updateColor(req.params.id as string, req.body);
    return sendSuccess(res, 200, 'Color updated successfully', color);
  }

  async deleteColor(req: Request, res: Response) {
    const color = await colorService.deleteColor(req.params.id as string);
    return sendSuccess(res, 200, 'Color deleted successfully', color);
  }

  // VariantColor handlers
  async createVariantColor(req: Request, res: Response) {
    const variantColor = await colorService.createVariantColor(req.body);
    return sendSuccess(res, 201, 'Variant color mapped successfully', variantColor);
  }

  async getVariantColors(req: Request, res: Response) {
    const { data, total } = await colorService.getVariantColors(req.query as unknown as any);
    return sendSuccess(res, 200, 'Variant colors retrieved successfully', {
      variantColors: data,
      pagination: {
        total,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        pages: Math.ceil(total / (Number(req.query.limit) || 10)),
      },
    });
  }

  async getVariantColorById(req: Request, res: Response) {
    const variantColor = await colorService.getVariantColorById(req.params.id as string);
    return sendSuccess(res, 200, 'Variant color retrieved successfully', variantColor);
  }

  async getColorsByVariantId(req: Request, res: Response) {
    const variantColors = await colorService.getColorsByVariantId(req.params.variantId as string);
    return sendSuccess(res, 200, 'Variant colors retrieved successfully', variantColors);
  }

  async updateVariantColor(req: Request, res: Response) {
    const variantColor = await colorService.updateVariantColor(req.params.id as string, req.body);
    return sendSuccess(res, 200, 'Variant color updated successfully', variantColor);
  }

  async deleteVariantColor(req: Request, res: Response) {
    const variantColor = await colorService.deleteVariantColor(req.params.id as string);
    return sendSuccess(res, 200, 'Variant color deleted successfully', variantColor);
  }
}

export const colorController = new ColorController();
