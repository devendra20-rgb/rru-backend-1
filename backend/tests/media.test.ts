import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import path from 'path';
import fs from 'fs/promises';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { VehicleModel as Model } from '../src/modules/catalog/models/model.model';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { Media } from '../src/modules/media/media.model';
import { generateAccessToken } from '../src/utils/jwt';

describe('Media API', () => {
  let adminToken: string;
  let variantId: string;
  let mediaId: string;

  beforeAll(async () => {
    await connectDB();
    adminToken = generateAccessToken({ userId: 'admin123', role: 'admin' });

    await Media.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});

    // Create hierarchy
    const brand = await Brand.create({
      brandCode: 'MED-BRAND',
      name: 'Media Brand',
      slug: 'media-brand',
    });

    const model = await Model.create({
      brandId: brand._id,
      modelCode: 'MED-MODEL',
      name: 'Media Model',
      slug: 'media-model',
    });

    const generation = await Generation.create({
      modelId: model._id,
      generationCode: 'MED-GEN',
      name: 'Media Gen',
      slug: 'media-gen',
      startYear: 2024,
    });

    const variant = await Variant.create({
      generationId: generation._id,
      variantCode: 'MED-VAR',
      name: 'Media Variant',
      slug: 'media-variant',
    });

    variantId = variant._id.toString();
    
    // Create dummy image file for testing
    await fs.mkdir(path.join(__dirname, 'fixtures'), { recursive: true });
    await fs.writeFile(path.join(__dirname, 'fixtures', 'test-image.jpg'), 'fake image content');
    await fs.writeFile(path.join(__dirname, 'fixtures', 'test-file.txt'), 'text content');
  });

  afterAll(async () => {
    await Media.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});
    
    // Cleanup fixtures
    await fs.rm(path.join(__dirname, 'fixtures'), { recursive: true, force: true });
    
    // Clean uploads (optional, but good for cleanliness)
    // await fs.rm(path.join(__dirname, '../uploads/media'), { recursive: true, force: true });

    await disconnectDB();
  });

  describe('POST /api/v1/media', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/media')
        .field('entityType', 'variant')
        .field('entityId', variantId);
      expect(response.status).toBe(401);
    });

    it('should reject non-image files', async () => {
      const response = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('entityType', 'variant')
        .field('entityId', variantId)
        .attach('file', path.join(__dirname, 'fixtures', 'test-file.txt'));

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Unsupported file type');
    });

    it('should upload an image and create media record', async () => {
      const response = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('entityType', 'variant')
        .field('entityId', variantId)
        .field('altText', 'Front view')
        .attach('file', path.join(__dirname, 'fixtures', 'test-image.jpg'));

      expect(response.status).toBe(201);
      expect(response.body.data.entityType).toBe('variant');
      expect(response.body.data.entityId).toBe(variantId);
      expect(response.body.data.altText).toBe('Front view');
      expect(response.body.data.storageProvider).toBe('local');
      expect(response.body.data.url).toContain('uploads/media');
      expect(response.body.data.isPrimary).toBe(true); // First media becomes primary
      
      mediaId = response.body.data.id;
    });

    it('should reject upload for non-existent variant', async () => {
      const response = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('entityType', 'variant')
        .field('entityId', '000000000000000000000001')
        .attach('file', path.join(__dirname, 'fixtures', 'test-image.jpg'));

      expect(response.status).toBe(404);
    });

    it('should handle setting a new primary media and unsetting old primary', async () => {
      const response = await request(app)
        .post('/api/v1/media')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('entityType', 'variant')
        .field('entityId', variantId)
        .field('isPrimary', 'true')
        .attach('file', path.join(__dirname, 'fixtures', 'test-image.jpg'));

      expect(response.status).toBe(201);
      expect(response.body.data.isPrimary).toBe(true);

      // Verify the first media is no longer primary
      const oldMediaResponse = await request(app).get(`/api/v1/media/${mediaId}`);
      expect(oldMediaResponse.body.data.isPrimary).toBe(false);
    });
  });

  describe('GET /api/v1/media', () => {
    it('should get a list of media', async () => {
      const response = await request(app).get('/api/v1/media');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.media)).toBe(true);
      expect(response.body.data.media.length).toBeGreaterThanOrEqual(2);
    });

    it('should get media by id', async () => {
      const response = await request(app).get(`/api/v1/media/${mediaId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.altText).toBe('Front view');
    });

    it('should get media for a specific variant via nested route', async () => {
      const response = await request(app).get(`/api/v1/variants/${variantId}/media`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PATCH /api/v1/media/:id', () => {
    it('should update media fields', async () => {
      const response = await request(app)
        .patch(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ altText: 'Updated front view' });

      expect(response.status).toBe(200);
      expect(response.body.data.altText).toBe('Updated front view');
    });
  });

  describe('DELETE /api/v1/media/:id', () => {
    it('should soft delete media', async () => {
      const response = await request(app)
        .delete(`/api/v1/media/${mediaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      
      const getResponse = await request(app).get(`/api/v1/media/${mediaId}`);
      expect(getResponse.status).toBe(404); // Should not return inactive media
    });
  });
});
