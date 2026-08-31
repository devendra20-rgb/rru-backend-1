import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { AppError } from '../../middlewares/error.middleware';
import { mediaRepository } from './media.repository';
import { variantRepository } from '../catalog/variants/variant.repository';
import { StorageFactory } from './storage/storage.factory';
import { FileData, FileStreamResult } from './storage/storage.interface';
import { CreateMediaDTO, UpdateMediaDTO, MediaQuery } from './media.types';

export class MediaService {
  private storage = StorageFactory.getProvider();

  private normalizeMedia(media: any) {
    if (!media) return media;
    const doc = media.toObject ? media.toObject() : { ...media };

    // If the URL is an AWS S3 bucket URL that isn't CloudFront and could be blocked by 403,
    // convert it to the backend media file endpoint using storageKey
    const cloudfront = process.env.AWS_CLOUDFRONT_URL?.trim();
    if (doc.url && doc.storageKey) {
      if (!cloudfront && doc.url.includes('.amazonaws.com/')) {
        doc.url = this.storage.getUrl(doc.storageKey);
      }
    }
    return doc;
  }

  async uploadMedia(file: Express.Multer.File, data: CreateMediaDTO) {
    if (data.entityType === 'variant' && data.entityId) {
      const variant = await variantRepository.findById(data.entityId);
      if (!variant) {
        throw new AppError('Variant not found', 404);
      }
    }

    // Prepare file data
    const fileData: FileData = {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };

    // Prefix storage key with folder or entityType
    let prefix = 'general';
    if (data.folder) {
      prefix = data.folder;
    } else if (data.entityType && data.entityId) {
      prefix = `${data.entityType}-${data.entityId}`;
    }

    // Upload via storage provider
    const storageKey = await this.storage.upload(fileData, prefix);
    const url = this.storage.getUrl(storageKey);

    // Handle isPrimary logic
    if (data.isPrimary && data.entityType && data.entityId) {
      await mediaRepository.unsetPrimary(data.entityType, data.entityId);
    } else if (data.entityType && data.entityId) {
      // If it's the first media, make it primary automatically
      const existing = await mediaRepository.findByEntity(data.entityType, data.entityId);
      if (existing.length === 0) {
        data.isPrimary = true;
      }
    }

    // Create DB record
    const created = await mediaRepository.create({
      folder: data.folder,
      entityType: data.entityType,
      entityId: data.entityId as any,
      mediaType: data.mediaType || 'image',
      altText: data.altText,
      isPrimary: Boolean(data.isPrimary),
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
      storageProvider: this.storage.providerName,
      storageKey,
      url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: 'active',
    });

    return this.normalizeMedia(created);
  }

  async getMediaList(query: MediaQuery) {
    const { data, total } = await mediaRepository.findAll(query);
    return {
      data: data.map((item) => this.normalizeMedia(item)),
      total,
    };
  }

  async getMediaById(id: string) {
    const media = await mediaRepository.findById(id);
    if (!media || media.status === 'inactive') {
      throw new AppError('Media not found', 404);
    }
    return this.normalizeMedia(media);
  }

  async getMediaByEntity(entityType: string, entityId: string) {
    const items = await mediaRepository.findByEntity(entityType, entityId);
    return items.map((item) => this.normalizeMedia(item));
  }

  async updateMedia(id: string, data: UpdateMediaDTO) {
    const media = await this.getMediaById(id);

    if (data.isPrimary && !media.isPrimary && media.entityType && media.entityId) {
      await mediaRepository.unsetPrimary(media.entityType, media.entityId.toString());
    }

    const updated = await mediaRepository.update(id, data);
    return this.normalizeMedia(updated);
  }

  async deleteMedia(id: string) {
    const media = await this.getMediaById(id);

    // We soft-delete the record
    await mediaRepository.delete(id);

    // If it was primary, try to set another one as primary
    if (media.isPrimary && media.entityType && media.entityId) {
      const others = await mediaRepository.findByEntity(
        media.entityType,
        media.entityId.toString(),
      );
      if (others.length > 0) {
        await mediaRepository.update(others[0]._id.toString(), { isPrimary: true });
      }
    }

    return { message: 'Media soft-deleted successfully' };
  }

  async getMediaStream(storageKey: string): Promise<FileStreamResult | null> {
    // 1. Try provider getStream
    if (this.storage.getStream) {
      try {
        const result = await this.storage.getStream(storageKey);
        if (result) return result;
      } catch (err) {
        console.error('Storage provider getStream error:', err);
      }
    }

    // 2. Fallback to local uploads directory
    try {
      const uploadDir = process.env.UPLOAD_DIR || 'uploads/media';
      const filePath = path.join(path.resolve(uploadDir), storageKey);
      await fs.access(filePath);
      const stat = await fs.stat(filePath);
      return {
        stream: createReadStream(filePath),
        contentLength: stat.size,
        lastModified: stat.mtime,
      };
    } catch {
      return null;
    }
  }
}

export const mediaService = new MediaService();
