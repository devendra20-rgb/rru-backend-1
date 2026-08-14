import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { VehicleModel } from '../src/modules/catalog/models/model.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { env } from '../src/config/env';
import jwt from 'jsonwebtoken';

const MOCK_TOKEN = jwt.sign(
  { userId: 'admin1', role: 'admin' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);

describe('Variants API', () => {
  let brandId: string;
  let modelId: string;
  let generationId: string;
  let variantId: string;

  beforeAll(async () => {
    // Setup Database
    await mongoose.connect(env.MONGODB_URI);

    // Clear collections
    await Brand.deleteMany({});
    await VehicleModel.deleteMany({});
    await Generation.deleteMany({});
    await Variant.deleteMany({});

    // Create a brand
    const brand = await Brand.create({
      brandCode: 'TEST_BRAND',
      name: 'Test Brand',
      slug: 'test-brand',
    });
    brandId = brand._id.toString();

    // Create a model
    const model = await VehicleModel.create({
      brandId,
      modelCode: 'TEST_MODEL',
      name: 'Test Model',
      slug: 'test-model',
    });
    modelId = model._id.toString();

    // Create a generation
    const gen = await Generation.create({
      modelId,
      generationCode: 'TEST_GEN',
      name: 'Test Gen',
      slug: 'test-gen',
    });
    generationId = gen._id.toString();
  });

  afterAll(async () => {
    await Brand.deleteMany({});
    await VehicleModel.deleteMany({});
    await Generation.deleteMany({});
    await Variant.deleteMany({});
    await mongoose.disconnect();
  });

  describe('POST /api/v1/variants', () => {
    it('should create a new variant', async () => {
      const res = await request(app)
        .post('/api/v1/variants')
        .set('Authorization', `Bearer ${MOCK_TOKEN}`) // Mock auth if needed
        .send({
          generationId,
          variantCode: 'TEST_VAR',
          name: 'Test Variant',
          fuelType: 'petrol',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.variantCode).toBe('TEST_VAR');
      expect(res.body.data.slug).toBe('test-variant');
      expect(res.body.data.fuelType).toBe('petrol');
      variantId = res.body.data._id;
    });

    it('should reject duplicate variant code', async () => {
      const res = await request(app)
        .post('/api/v1/variants')
        .set('Authorization', `Bearer ${MOCK_TOKEN}`)
        .send({
          generationId,
          variantCode: 'TEST_VAR',
          name: 'Another Variant',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid generationId', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post('/api/v1/variants')
        .set('Authorization', `Bearer ${MOCK_TOKEN}`)
        .send({
          generationId: fakeId,
          variantCode: 'TEST_VAR_2',
          name: 'Test Variant 2',
        });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/variants', () => {
    it('should list variants with pagination', async () => {
      const res = await request(app).get('/api/v1/variants?limit=10');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta.total).toBe(1);
    });

    it('should filter by brandId', async () => {
      const res = await request(app).get(`/api/v1/variants?brandId=${brandId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe(variantId);
    });

    it('should filter by modelId', async () => {
      const res = await request(app).get(`/api/v1/variants?modelId=${modelId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe(variantId);
    });

    it('should filter by generationId', async () => {
      const res = await request(app).get(`/api/v1/variants?generationId=${generationId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe(variantId);
    });
  });

  describe('GET /api/v1/variants/:id', () => {
    it('should get a variant by id and include parents', async () => {
      const res = await request(app).get(`/api/v1/variants/${variantId}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(variantId);
      expect(res.body.data.generation).toBeDefined();
      expect(res.body.data.model).toBeDefined();
    });
  });

  describe('GET /api/v1/generations/:generationId/variants', () => {
    it('should return nested variants', async () => {
      const res = await request(app).get(`/api/v1/generations/${generationId}/variants`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe(variantId);
    });
  });

  describe('PATCH /api/v1/variants/:id', () => {
    it('should update a variant', async () => {
      const res = await request(app)
        .patch(`/api/v1/variants/${variantId}`)
        .set('Authorization', `Bearer ${MOCK_TOKEN}`)
        .send({
          name: 'Updated Variant Name',
          modelYear: 2026,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Variant Name');
      expect(res.body.data.modelYear).toBe(2026);
    });
  });

  describe('DELETE /api/v1/variants/:id', () => {
    it('should soft delete a variant', async () => {
      const res = await request(app)
        .delete(`/api/v1/variants/${variantId}`)
        .set('Authorization', `Bearer ${MOCK_TOKEN}`);

      expect(res.status).toBe(200);

      // Verify it's inactive
      const checkRes = await request(app).get(`/api/v1/variants/${variantId}`);
      expect(checkRes.status).toBe(200);
      expect(checkRes.body.data.status).toBe('inactive');
    });
  });

  describe('Generation Dependency Check', () => {
    it('should not allow deleting a generation with variants', async () => {
      const res = await request(app)
        .delete(`/api/v1/generations/${generationId}`)
        .set('Authorization', `Bearer ${MOCK_TOKEN}`);

      expect(res.status).toBe(409); // Conflict
    });
  });
});
