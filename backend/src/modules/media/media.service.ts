import { AppError } from '../../middlewares/error.middleware';
import { mediaRepository } from './media.repository';
import { variantRepository } from '../catalog/variants/variant.repository';
import { StorageFactory } from './storage/storage.factory';
import { FileData } from './storage/storage.interface';
import { CreateMediaDTO, UpdateMediaDTO, MediaQuery } from './media.types';

export class MediaService {
  private storage = StorageFactory.getProvider();

  async uploadMedia(file: Express.Multer.File, data: CreateMediaDTO) {
    if (data.entityType === 'variant') {
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

    // Prefix storage key with entityType
    const prefix = `${data.entityType}-${data.entityId}`;

    // Upload via storage provider
    const storageKey = await this.storage.upload(fileData, prefix);
    const url = this.storage.getUrl(storageKey);

    // Handle isPrimary logic
    if (data.isPrimary) {
      await mediaRepository.unsetPrimary(data.entityType, data.entityId);
    } else {
      // If it's the first media, make it primary automatically
      const existing = await mediaRepository.findByEntity(data.entityType, data.entityId);
      if (existing.length === 0) {
        data.isPrimary = true;
      }
    }

    // Create DB record
    return mediaRepository.create({
      entityType: data.entityType,
      entityId: data.entityId as any,
      mediaType: data.mediaType || 'image',
      altText: data.altText,
      isPrimary: Boolean(data.isPrimary),
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
      storageProvider: 'local', // We are currently only using local
      storageKey,
      url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: 'active',
    });
  }

  async getMediaList(query: MediaQuery) {
    return mediaRepository.findAll(query);
  }

  async getMediaById(id: string) {
    const media = await mediaRepository.findById(id);
    if (!media || media.status === 'inactive') {
      throw new AppError('Media not found', 404);
    }
    return media;
  }

  async getMediaByEntity(entityType: string, entityId: string) {
    return mediaRepository.findByEntity(entityType, entityId);
  }

  async updateMedia(id: string, data: UpdateMediaDTO) {
    const media = await this.getMediaById(id);

    if (data.isPrimary && !media.isPrimary) {
      await mediaRepository.unsetPrimary(media.entityType, media.entityId.toString());
    }

    const updated = await mediaRepository.update(id, data);
    return updated;
  }

  async deleteMedia(id: string) {
    const media = await this.getMediaById(id);

    // We soft-delete the record
    await mediaRepository.delete(id);

    // If it was primary, try to set another one as primary
    if (media.isPrimary) {
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
