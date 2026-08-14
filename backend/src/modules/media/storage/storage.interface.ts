export interface FileData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface IStorageProvider {
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
}
