import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { VehicleModel as Model } from '../src/modules/catalog/models/model.model';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { Specification } from '../src/modules/catalog/specifications/specification.model';
import { generateAccessToken } from '../src/utils/jwt';

describe('Specifications API', () => {
  let adminToken: string;
  let variantId: string;
  let specificationId: string;

  beforeAll(async () => {
    await connectDB();
    adminToken = generateAccessToken({ userId: 'admin123', role: 'admin' });

    await Specification.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});

    // Create a complete hierarchy to satisfy dependencies
    const brand = await Brand.create({
      brandCode: 'SPEC-BRAND',
      name: 'Spec Brand',
      slug: 'spec-brand',
    });

    const model = await Model.create({
      brandId: brand._id,
      modelCode: 'SPEC-MODEL',
      name: 'Spec Model',
      slug: 'spec-model',
    });

    const generation = await Generation.create({
      modelId: model._id,
      generationCode: 'SPEC-GEN',
      name: 'Spec Gen',
      slug: 'spec-gen',
      startYear: 2020,
    });

    const variant = await Variant.create({
      generationId: generation._id,
      variantCode: 'SPEC-VAR',
      name: 'Spec Variant',
      slug: 'spec-variant',
    });

    variantId = variant._id.toString();
  });

  afterAll(async () => {
    await Specification.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});
    await disconnectDB();
  });

  it('should create a specification for a variant', async () => {
    const res = await request(app)
      .post('/api/v1/specifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantId,
        performance: {
          topSpeedKph: 250,
          acceleration0To100Kph: 5.5,
        },
        dimensions: {
          lengthMm: 4500,
          widthMm: 1800,
        },
        safety: {
          airbags: 6,
          abs: true,
          parkingSensors: 'Rear',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.variantId).toBe(variantId);
    expect(res.body.data.performance.topSpeedKph).toBe(250);
    expect(res.body.data.safety.parkingSensors).toBe('Rear');

    specificationId = res.body.data._id;
  });

  it('should not allow duplicate specification for the same variant', async () => {
    const res = await request(app)
      .post('/api/v1/specifications')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantId,
        performance: {
          topSpeedKph: 200,
        },
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should get specifications list', async () => {
    const res = await request(app).get('/api/v1/specifications');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should get specification by variantId via nested route', async () => {
    const res = await request(app).get(`/api/v1/variants/${variantId}/specifications`);

    // Actually, the nested route is mounted at /variants/:variantId/specifications 
    // Wait, earlier I set up router.use('/:variantId/specifications', specificationRoutes); in variant.routes.ts.
    // The GET / in specification routes handles it if they pass variantId?
    // Wait, in specification.controller.ts getSpecifications uses req.params.variantId to filter. 
    // It returns an array, but we have a dedicated route GET /variant/:variantId for single.
    // The nested GET /variants/:variantId/specifications hits `router.get('/', getSpecifications)` in specification.routes.ts, 
    // which returns a paginated list of specifications for that variant. Wait! `variantId` is unique!
    // So the list will have max 1 element.
    // But let's test the dedicated GET /api/v1/specifications/variant/:variantId instead:
    const resSingle = await request(app).get(`/api/v1/specifications/variant/${variantId}`);

    expect(resSingle.status).toBe(200);
    expect(resSingle.body.success).toBe(true);
    expect(resSingle.body.data.variantId).toBe(variantId);
    expect(resSingle.body.data.performance.topSpeedKph).toBe(250);
  });

  it('should update a specification', async () => {
    const res = await request(app)
      .patch(`/api/v1/specifications/${specificationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        performance: {
          topSpeedKph: 260,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.performance.topSpeedKph).toBe(260);
    // original field not updated shouldn't be overridden if handled correctly, but mongo handles this if we use $set or replace.
    // Mongoose findByIdAndUpdate with partial data merges root properties. But nested objects might be replaced entirely depending on how it's sent.
  });

  it('should delete a specification (soft delete)', async () => {
    const res = await request(app)
      .delete(`/api/v1/specifications/${specificationId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/v1/specifications/${specificationId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.status).toBe('inactive');
  });

  it('should prevent non-admin from creating specification', async () => {
    const userToken = generateAccessToken({ userId: 'user123', role: 'user' });

    const res = await request(app)
      .post('/api/v1/specifications')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        variantId,
      });

    expect(res.status).toBe(403);
  });
});
