import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { VehicleModel as Model } from '../src/modules/catalog/models/model.model';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { Color, VariantColor } from '../src/modules/catalog/colors/color.model';
import { generateAccessToken } from '../src/utils/jwt';

describe('Colors API', () => {
  let adminToken: string;
  let variantId: string;
  let colorId: string;
  let variantColorId: string;

  beforeAll(async () => {
    await connectDB();
    adminToken = generateAccessToken({ userId: 'admin123', role: 'admin' });

    await VariantColor.deleteMany({});
    await Color.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});

    // Create a complete hierarchy to satisfy dependencies
    const brand = await Brand.create({
      brandCode: 'COL-BRAND',
      name: 'Color Brand',
      slug: 'color-brand',
    });

    const model = await Model.create({
      brandId: brand._id,
      modelCode: 'COL-MODEL',
      name: 'Color Model',
      slug: 'color-model',
    });

    const generation = await Generation.create({
      modelId: model._id,
      generationCode: 'COL-GEN',
      name: 'Color Gen',
      slug: 'color-gen',
      startYear: 2024,
    });

    const variant = await Variant.create({
      generationId: generation._id,
      variantCode: 'COL-VAR',
      name: 'Color Variant',
      slug: 'color-variant',
    });

    variantId = variant._id.toString();
  });

  afterAll(async () => {
    await VariantColor.deleteMany({});
    await Color.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});
    await disconnectDB();
  });

  // Color Tests
  describe('POST /api/v1/colors', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/colors')
        .send({ name: 'Pearl White', type: 'exterior' });
      expect(response.status).toBe(401);
    });

    it('should create a new color', async () => {
      const response = await request(app)
        .post('/api/v1/colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Pearl White',
          hexCode: '#F5F5F5',
          type: 'exterior',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.name).toBe('Pearl White');
      expect(response.body.data.slug).toBe('pearl-white');
      expect(response.body.data.type).toBe('exterior');
      expect(response.body.data.hexCode).toBe('#F5F5F5');
      colorId = response.body.data.id;
    });

    it('should prevent duplicate color names', async () => {
      const response = await request(app)
        .post('/api/v1/colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Pearl White', type: 'interior' });

      expect(response.status).toBe(409);
    });

    it('should reject an invalid hexCode', async () => {
      const response = await request(app)
        .post('/api/v1/colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Bad Color', hexCode: 'not-a-hex', type: 'exterior' });

      expect(response.status).toBe(400);
    });

    it('should reject a missing required type field', async () => {
      const response = await request(app)
        .post('/api/v1/colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'No Type Color' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/colors', () => {
    it('should return a list of colors', async () => {
      const response = await request(app).get('/api/v1/colors');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.colors)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should get a color by id', async () => {
      const response = await request(app).get(`/api/v1/colors/${colorId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Pearl White');
    });

    it('should get a color by slug', async () => {
      const response = await request(app).get('/api/v1/colors/slug/pearl-white');
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Pearl White');
    });

    it('should return 404 for a non-existent color id', async () => {
      const response = await request(app).get('/api/v1/colors/000000000000000000000001');
      expect(response.status).toBe(404);
    });

    it('should filter colors by type', async () => {
      const response = await request(app).get('/api/v1/colors?type=exterior');
      expect(response.status).toBe(200);
      expect(response.body.data.colors.every((c: any) => c.type === 'exterior')).toBe(true);
    });
  });

  describe('PATCH /api/v1/colors/:id', () => {
    it('should update a color', async () => {
      const response = await request(app)
        .patch(`/api/v1/colors/${colorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ hexCode: '#FFFFFF' });

      expect(response.status).toBe(200);
      expect(response.body.data.hexCode).toBe('#FFFFFF');
    });

    it('should reject an update with no fields', async () => {
      const response = await request(app)
        .patch(`/api/v1/colors/${colorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  // VariantColor Tests
  describe('POST /api/v1/variant-colors', () => {
    it('should map a color to a variant', async () => {
      const response = await request(app)
        .post('/api/v1/variant-colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          variantId,
          colorId,
          availability: 'standard',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.availability).toBe('standard');
      variantColorId = response.body.data.id;
    });

    it('should prevent duplicate mapping for the same variant and color', async () => {
      const response = await request(app)
        .post('/api/v1/variant-colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          variantId,
          colorId,
          availability: 'optional',
        });

      expect(response.status).toBe(409);
    });

    it('should return 404 for a non-existent variant', async () => {
      const response = await request(app)
        .post('/api/v1/variant-colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          variantId: '000000000000000000000001',
          colorId,
          availability: 'standard',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/variant-colors', () => {
    it('should return a list of variant colors', async () => {
      const response = await request(app).get('/api/v1/variant-colors');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.variantColors)).toBe(true);
    });

    it('should get a variant color by id', async () => {
      const response = await request(app).get(`/api/v1/variant-colors/${variantColorId}`);
      expect(response.status).toBe(200);
      expect(response.body.data.availability).toBe('standard');
    });

    it('should get colors mapped to a specific variant via nested route', async () => {
      const response = await request(app).get(`/api/v1/variants/${variantId}/colors`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].colorId.name).toBe('Pearl White');
    });
  });

  describe('PATCH /api/v1/variant-colors/:id', () => {
    it('should update a variant color', async () => {
      const response = await request(app)
        .patch(`/api/v1/variant-colors/${variantColorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ availability: 'optional' });

      expect(response.status).toBe(200);
      expect(response.body.data.availability).toBe('optional');
    });
  });

  describe('DELETE /api/v1/variant-colors/:id', () => {
    it('should soft delete a variant color', async () => {
      const response = await request(app)
        .delete(`/api/v1/variant-colors/${variantColorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('inactive');
    });
  });

  describe('DELETE /api/v1/colors/:id', () => {
    it('should soft delete a color', async () => {
      const response = await request(app)
        .delete(`/api/v1/colors/${colorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('inactive');
    });
  });
});
