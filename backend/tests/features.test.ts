import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { VehicleModel as Model } from '../src/modules/catalog/models/model.model';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { Feature, VariantFeature } from '../src/modules/catalog/features/feature.model';
import { generateAccessToken } from '../src/utils/jwt';

describe('Features API', () => {
  let adminToken: string;
  let variantId: string;
  let featureId: string;
  let variantFeatureId: string;

  beforeAll(async () => {
    await connectDB();
    adminToken = generateAccessToken({ userId: 'admin123', role: 'admin' });

    await VariantFeature.deleteMany({});
    await Feature.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});

    // Create a complete hierarchy to satisfy dependencies
    const brand = await Brand.create({
      brandCode: 'FEAT-BRAND',
      name: 'Feat Brand',
      slug: 'feat-brand',
    });

    const model = await Model.create({
      brandId: brand._id,
      modelCode: 'FEAT-MODEL',
      name: 'Feat Model',
      slug: 'feat-model',
    });

    const generation = await Generation.create({
      modelId: model._id,
      generationCode: 'FEAT-GEN',
      name: 'Feat Gen',
      slug: 'feat-gen',
      startYear: 2024,
    });

    const variant = await Variant.create({
      generationId: generation._id,
      variantCode: 'FEAT-VAR',
      name: 'Feat Variant',
      slug: 'feat-variant',
    });

    variantId = variant._id.toString();
  });

  afterAll(async () => {
    await VariantFeature.deleteMany({});
    await Feature.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});
    await disconnectDB();
  });

  // Feature Tests
  describe('POST /api/v1/features', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/features')
        .send({ name: 'Airbags', category: 'safety' });
      expect(response.status).toBe(401);
    });

    it('should create a new feature', async () => {
      const response = await request(app)
        .post('/api/v1/features')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Sunroof',
          category: 'exterior',
          description: 'Panoramic sunroof',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Sunroof');
      expect(response.body.data.slug).toBe('sunroof');
      expect(response.body.data.category).toBe('exterior');
      featureId = response.body.data.id;
    });

    it('should prevent duplicate feature names', async () => {
      const response = await request(app)
        .post('/api/v1/features')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Sunroof', category: 'interior' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/v1/features', () => {
    it('should return a list of features', async () => {
      const response = await request(app).get('/api/v1/features');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.features)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should get a feature by id', async () => {
      const response = await request(app).get(`/api/v1/features/${featureId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Sunroof');
    });

    it('should get a feature by slug', async () => {
      const response = await request(app).get('/api/v1/features/slug/sunroof');
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Sunroof');
    });
  });

  describe('PATCH /api/v1/features/:id', () => {
    it('should update a feature', async () => {
      const response = await request(app)
        .patch(`/api/v1/features/${featureId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated description' });

      expect(response.status).toBe(200);
      expect(response.body.data.description).toBe('Updated description');
    });
  });

  // VariantFeature Tests
  describe('POST /api/v1/variant-features', () => {
    it('should map a feature to a variant', async () => {
      const response = await request(app)
        .post('/api/v1/variant-features')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          variantId,
          featureId,
          availability: 'standard',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.availability).toBe('standard');
      variantFeatureId = response.body.data.id;
    });

    it('should prevent duplicate mapping for the same variant and feature', async () => {
      const response = await request(app)
        .post('/api/v1/variant-features')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          variantId,
          featureId,
          availability: 'optional',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/v1/variant-features', () => {
    it('should return a list of variant features', async () => {
      const response = await request(app).get('/api/v1/variant-features');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.variantFeatures)).toBe(true);
    });

    it('should get a variant feature by id', async () => {
      const response = await request(app).get(`/api/v1/variant-features/${variantFeatureId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.availability).toBe('standard');
    });

    it('should get features mapped to a specific variant via nested route', async () => {
      const response = await request(app).get(`/api/v1/variants/${variantId}/features`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].featureId.name).toBe('Sunroof');
    });
  });

  describe('PATCH /api/v1/variant-features/:id', () => {
    it('should update a variant feature', async () => {
      const response = await request(app)
        .patch(`/api/v1/variant-features/${variantFeatureId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          availability: 'optional',
          value: 'Panoramic only',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.availability).toBe('optional');
      expect(response.body.data.value).toBe('Panoramic only');
    });
  });

  describe('DELETE /api/v1/variant-features/:id', () => {
    it('should soft delete a variant feature', async () => {
      const response = await request(app)
        .delete(`/api/v1/variant-features/${variantFeatureId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('inactive');
    });
  });

  describe('DELETE /api/v1/features/:id', () => {
    it('should soft delete a feature', async () => {
      const response = await request(app)
        .delete(`/api/v1/features/${featureId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('inactive');
    });
  });
});
