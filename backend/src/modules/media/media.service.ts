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

  /**
   * Attach an existing media file to another entity by creating a lightweight
   * Media document that reuses the same url / underlying storage object.
   * Does not re-upload or duplicate binary files. storageKey is unique, so
   * linked records use a resolvable `shared/{sourceId}/{entityId}` key.
   */
  async linkExistingMediaToEntity(
    sourceMediaId: string,
    entityType: 'variant' | 'brand' | 'model' | 'generation',
    entityId: string,
  ) {
    const source = await mediaRepository.findById(sourceMediaId);
    if (!source || source.status === 'inactive') {
      throw new AppError('Source media not found', 404);
    }

    // Resolve to the original media if this is already a shared link
    let root = source;
    let depth = 0;
    while (root.storageKey?.startsWith('shared/') && depth < 5) {
      const rootId = root.storageKey.split('/')[1];
      const next = rootId ? await mediaRepository.findById(rootId) : null;
      if (!next) break;
      root = next;
      depth += 1;
    }

    // Avoid duplicate link records for the same entity + file url
    const existingForEntity = await mediaRepository.findByEntity(entityType, entityId);
    const alreadyLinked = existingForEntity.find(
      (item) =>
        item.url === root.url ||
        item.storageKey === root.storageKey ||
        item.storageKey === `shared/${root._id.toString()}/${entityId}`,
    );
    if (alreadyLinked) {
      return this.normalizeMedia(alreadyLinked);
    }

    if (entityType === 'variant') {
      const variant = await variantRepository.findById(entityId);
      if (!variant) {
        throw new AppError('Variant not found', 404);
      }
    }

    const created = await mediaRepository.create({
      folder: root.folder,
      entityType,
      entityId: entityId as any,
      colorId: root.colorId,
      angleTag: root.angleTag,
      mediaType: root.mediaType,
      storageProvider: root.storageProvider,
      // Unique key that still resolves to the original file via getMediaStream
      storageKey: `shared/${root._id.toString()}/${entityId}`,
      url: root.url,
      originalName: root.originalName,
      mimeType: root.mimeType,
      size: root.size,
      altText: root.altText,
      isPrimary: existingForEntity.length === 0,
      sortOrder: root.sortOrder ?? 0,
      status: 'active',
    });

    return this.normalizeMedia(created);
  }

  private async resolvePhysicalStorageKey(
    storageKey: string,
    depth = 0,
  ): Promise<string> {
    if (!storageKey?.startsWith('shared/') || depth >= 5) {
      return storageKey;
    }
    const sourceId = storageKey.split('/')[1];
    if (!sourceId) return storageKey;
    const source = await mediaRepository.findById(sourceId);
    if (!source?.storageKey) return storageKey;
    return this.resolvePhysicalStorageKey(source.storageKey, depth + 1);
  }

  async getMediaStream(storageKey: string): Promise<FileStreamResult | null> {
    const resolvedKey = await this.resolvePhysicalStorageKey(storageKey);

    // 1. Try provider getStream
    if (this.storage.getStream) {
      try {
        const result = await this.storage.getStream(resolvedKey);
        if (result) return result;
      } catch (err) {
        console.error('Storage provider getStream error:', err);
      }
    }

    // 2. Fallback to local uploads directory
    try {
      const uploadDir = process.env.UPLOAD_DIR || 'uploads/media';
      const filePath = path.join(path.resolve(uploadDir), resolvedKey);
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
