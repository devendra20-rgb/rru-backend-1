import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { IStorageProvider, FileData, FileStreamResult } from './storage.interface';
import { env } from '../../../config/env';
import path from 'path';
import crypto from 'crypto';

export class S3StorageProvider implements IStorageProvider {
  readonly providerName = 's3';
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private cloudfrontUrl?: string;

  constructor() {
    const region = env.AWS_REGION || process.env.AWS_REGION;
    const accessKeyId = env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const bucket = env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET;
    const cloudfrontUrl = env.AWS_CLOUDFRONT_URL || process.env.AWS_CLOUDFRONT_URL;

    if (!region || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error('Missing AWS S3 configuration parameters.');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucket = bucket;
    this.region = region;
    this.cloudfrontUrl = cloudfrontUrl && cloudfrontUrl.trim() !== '' ? cloudfrontUrl.trim() : undefined;
  }

  async upload(file: FileData, prefix: string): Promise<string> {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const storageKey = `${prefix}-${uniqueSuffix}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return storageKey;
  }

  async delete(storageKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
    });

    await this.s3Client.send(command);
  }

  async getStream(storageKey: string): Promise<FileStreamResult | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: storageKey,
      });

      const response = await this.s3Client.send(command);
      if (!response.Body) {
        return null;
      }

      return {
        stream: response.Body as Readable,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        etag: response.ETag,
        lastModified: response.LastModified,
      };
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  getUrl(storageKey: string): string {
    if (this.cloudfrontUrl) {
      const base = this.cloudfrontUrl.replace(/\/$/, '');
      return `${base}/${storageKey}`;
    }
    if (process.env.MEDIA_BASE_URL) {
      return `${process.env.MEDIA_BASE_URL.replace(/\/$/, '')}/${storageKey}`;
    }
    return `/api/v1/media/file/${storageKey}`;
  }
}
