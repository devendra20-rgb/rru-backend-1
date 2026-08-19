import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { IStorageProvider, FileData } from './storage.interface';
import { env } from '../../../config/env';

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads/media';
    this.baseUrl = process.env.MEDIA_BASE_URL || 'http://localhost:5000/uploads/media';

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
}
