import { IStorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';

export class StorageFactory {
  private static instance: IStorageProvider;

  static getProvider(): IStorageProvider {
    if (!this.instance) {
      // Future: Check env var to conditionally return S3StorageProvider
      this.instance = new LocalStorageProvider();
    }
    return this.instance;
  }
}
