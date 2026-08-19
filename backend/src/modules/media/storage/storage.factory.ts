import { IStorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';
import { S3StorageProvider } from './s3.storage';
import { env } from '../../../config/env';

export class StorageFactory {
  private static instance: IStorageProvider;

  static getProvider(): IStorageProvider {
    if (!this.instance) {
      const bucket = env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET;
      const keyId = env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
      const secret = env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

      if (bucket && keyId && secret) {
        try {
          this.instance = new S3StorageProvider();
        } catch (error) {
          console.error('Failed to initialize S3 Storage Provider, falling back to Local:', error);
          this.instance = new LocalStorageProvider();
        }
      } else {
        this.instance = new LocalStorageProvider();
      }
    }
    return this.instance;
  }
}
