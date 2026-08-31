import { Readable } from 'stream';

export interface FileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface FileStreamResult {
  stream: Readable;
  contentType?: string;
  contentLength?: number;
  etag?: string;
  lastModified?: Date;
}

export interface IStorageProvider {
  readonly providerName: 'local' | 's3';
  /**
   * Uploads a file and returns the storage key.
   */
  upload(file: FileData, prefix: string): Promise<string>;

  /**
   * Deletes a file given its storage key.
   */
  delete(storageKey: string): Promise<void>;

  /**
   * Gets the public URL for a given storage key.
   */
  getUrl(storageKey: string): string;

  /**
   * Gets a readable stream for a given storage key.
   */
  getStream?(storageKey: string): Promise<FileStreamResult | null>;
}
