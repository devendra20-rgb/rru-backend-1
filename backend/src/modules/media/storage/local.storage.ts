import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { IStorageProvider, FileData, FileStreamResult } from './storage.interface';
import { env } from '../../../config/env';

export class LocalStorageProvider implements IStorageProvider {
  readonly providerName = 'local';
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads/media';
    this.baseUrl = process.env.MEDIA_BASE_URL || `http://localhost:${env.PORT || 5000}/api/v1/media/file`;

    // Ensure the directory exists
    fs.mkdir(path.resolve(this.uploadDir), { recursive: true }).catch(console.error);
  }

  async upload(file: FileData, prefix: string): Promise<string> {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const storageKey = `${prefix}-${uniqueSuffix}${ext}`;

    const filePath = path.join(path.resolve(this.uploadDir), storageKey);
    await fs.writeFile(filePath, file.buffer);

    return storageKey;
  }

  async delete(storageKey: string): Promise<void> {
    try {
      const filePath = path.join(path.resolve(this.uploadDir), storageKey);
      await fs.unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // If file doesn't exist, we consider it deleted
    }
  }

  async getStream(storageKey: string): Promise<FileStreamResult | null> {
    try {
      const filePath = path.join(path.resolve(this.uploadDir), storageKey);
      await fs.access(filePath);
      const stat = await fs.stat(filePath);
      const stream = createReadStream(filePath);
      return {
        stream,
        contentLength: stat.size,
        lastModified: stat.mtime,
      };
    } catch {
      return null;
    }
  }

  getUrl(storageKey: string): string {
    const cleanBase = (this.baseUrl || `http://localhost:${env.PORT || 5000}/api/v1/media/file`).replace(/\/$/, '');
    return `${cleanBase}/${storageKey}`;
  }
}
