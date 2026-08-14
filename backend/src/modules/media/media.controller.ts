import { Request, Response } from 'express';
import { mediaService } from './media.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/error.middleware';

export class MediaController {
  async uploadMedia(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }
    const media = await mediaService.uploadMedia(req.file, req.body);
    return sendSuccess(res, 201, 'Media uploaded successfully', media);
  }

  async getMediaList(req: Request, res: Response) {
    const { data, total } = await mediaService.getMediaList(req.query as any);
    return sendSuccess(res, 200, 'Media retrieved successfully', {
      media: data,
      pagination: {
        total,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        pages: Math.ceil(total / (Number(req.query.limit) || 10)),
      },
    });
  }

  async getMediaById(req: Request, res: Response) {
    const media = await mediaService.getMediaById(req.params.id as string);
    return sendSuccess(res, 200, 'Media retrieved successfully', media);
  }

  async getMediaByVariantId(req: Request, res: Response) {
    const media = await mediaService.getMediaByEntity('variant', req.params.variantId as string);
    return sendSuccess(res, 200, 'Variant media retrieved successfully', media);
  }

  async updateMedia(req: Request, res: Response) {
    const media = await mediaService.updateMedia(req.params.id as string, req.body);
    return sendSuccess(res, 200, 'Media updated successfully', media);
  }

  async deleteMedia(req: Request, res: Response) {
    await mediaService.deleteMedia(req.params.id as string);
    return sendSuccess(res, 200, 'Media deleted successfully', null);
  }
}

export const mediaController = new MediaController();
