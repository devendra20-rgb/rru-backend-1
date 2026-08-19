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
   * Generates a short-lived presigned URL for direct access.
   * Required for providers that keep files private (e.g., S3).
   */
  getPresignedUrl?(storageKey: string): Promise<string>;
}
