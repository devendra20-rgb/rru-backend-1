import { Request, Response } from 'express';
import path from 'path';
import { mediaService } from './media.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/error.middleware';

export class MediaController {
  async serveMediaFile(req: Request, res: Response) {
    const key = (req.params.key || req.params[0]) as string;
    if (!key) {
      throw new AppError('File key is required', 400);
    }

    const result = await mediaService.getMediaStream(key);
    if (!result) {
      throw new AppError('File not found', 404);
    }

    if (result.contentType) {
      res.setHeader('Content-Type', result.contentType);
    } else {
      const ext = path.extname(key).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
      };
      if (mimeTypes[ext]) {
        res.setHeader('Content-Type', mimeTypes[ext]);
      }
    }

    if (result.contentLength) {
      res.setHeader('Content-Length', result.contentLength);
    }
    if (result.etag) {
      res.setHeader('ETag', result.etag);
    }
    if (result.lastModified) {
      res.setHeader('Last-Modified', result.lastModified.toUTCString());
    }

    // Set cache header
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Handle 304 Not Modified
    if (
      (req.headers['if-none-match'] && req.headers['if-none-match'] === result.etag) ||
      (req.headers['if-modified-since'] && result.lastModified && new Date(req.headers['if-modified-since']) >= result.lastModified)
    ) {
      return res.status(304).end();
    }

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    (result.stream as any).pipe(res);
  }

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
