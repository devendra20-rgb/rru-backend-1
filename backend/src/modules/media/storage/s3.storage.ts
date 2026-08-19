import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';
import { env } from '../../../config/env';
import { IStorageProvider, FileData } from './storage.interface';

export class S3StorageProvider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor() {
    if (!env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_S3_BUCKET) {
      throw new Error('Missing AWS S3 configuration parameters');
    }
    
    this.bucket = env.AWS_S3_BUCKET;
    this.client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async upload(file: FileData, prefix: string): Promise<string> {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const storageKey = `ride-round-up/media/${prefix}/${uniqueSuffix}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.client.send(command);

    return storageKey;
  }

  async delete(storageKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
    });
    
    await this.client.send(command);
  }

  async getPresignedUrl(storageKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
    });

    // 15 minutes expiration
    return getSignedUrl(this.client, command, { expiresIn: 900 });
  }
}
