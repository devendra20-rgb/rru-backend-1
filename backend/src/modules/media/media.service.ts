import { AppError } from '../../middlewares/error.middleware';
import { mediaRepository } from './media.repository';
import { variantRepository } from '../catalog/variants/variant.repository';
import { StorageFactory } from './storage/storage.factory';
import { FileData } from './storage/storage.interface';
import { CreateMediaDTO, UpdateMediaDTO, MediaQuery } from './media.types';
import { env } from '../../config/env';

export class MediaService {
  private storage = StorageFactory.getProvider();

  private attachUrl(media: any) {
    if (!media) return media;
    // Handle both Mongoose documents and plain objects
    const obj = typeof media.toObject === 'function' ? media.toObject() : { ...media };
    const baseUrl = env.API_BASE_URL || 'http://localhost:5000/api/v1';
    obj.url = `${baseUrl}/media/file/${obj.storageKey}`;
    return obj;
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
      storageProvider: this.storage.constructor.name === 'S3StorageProvider' ? 's3' : 'local',
      storageKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: 'active',
    });
    
    return this.attachUrl(created);
  }

  async getMediaList(query: MediaQuery) {
    const result = await mediaRepository.findAll(query);
    return {
      data: result.data.map(m => this.attachUrl(m)),
      total: result.total,
    };
  }

  async getMediaById(id: string) {
    const media = await mediaRepository.findById(id);
    if (!media || media.status === 'inactive') {
      throw new AppError('Media not found', 404);
    }
    return this.attachUrl(media);
  }

  async getMediaByEntity(entityType: string, entityId: string) {
    const result = await mediaRepository.findByEntity(entityType, entityId);
    return result.map(m => this.attachUrl(m));
  }

  async updateMedia(id: string, data: UpdateMediaDTO) {
    const media = await this.getMediaById(id);

    if (data.isPrimary && !media.isPrimary && media.entityType && media.entityId) {
      await mediaRepository.unsetPrimary(media.entityType, media.entityId.toString());
    }

    const updated = await mediaRepository.update(id, data);
    return this.attachUrl(updated);
  }

  async deleteMedia(id: string) {
    const media = await mediaRepository.findById(id);
    if (!media) {
      throw new AppError('Media not found', 404);
    }

    // Physically delete file
    const provider = StorageFactory.getProvider(media.storageProvider);
    await provider.delete(media.storageKey);

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
}

export const mediaService = new MediaService();
