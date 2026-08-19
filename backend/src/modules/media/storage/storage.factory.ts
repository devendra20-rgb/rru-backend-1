import { IStorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';
import { S3StorageProvider } from './s3.storage';
import { env } from '../../../config/env';

export class StorageFactory {
  private static localInstance: IStorageProvider;
  private static s3Instance: IStorageProvider;

  static getProvider(name?: string): IStorageProvider {
    if (name === 'local') {
      if (!this.localInstance) this.localInstance = new LocalStorageProvider();
      return this.localInstance;
    }
    if (name === 's3') {
      if (!this.s3Instance) this.s3Instance = new S3StorageProvider();
      return this.s3Instance;
    }

    if (env.NODE_ENV === 'production') {
      if (!env.AWS_S3_BUCKET) {
        throw new Error('S3 configuration is missing in production environment');
      }
      if (!this.s3Instance) this.s3Instance = new S3StorageProvider();
      return this.s3Instance;
    } else {
      if (env.AWS_S3_BUCKET) {
        if (!this.s3Instance) this.s3Instance = new S3StorageProvider();
        return this.s3Instance;
      }
      if (!this.localInstance) this.localInstance = new LocalStorageProvider();
      return this.localInstance;
    }
  }
}
