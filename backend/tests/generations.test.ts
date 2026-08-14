import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { VehicleModel } from '../src/modules/catalog/models/model.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { env } from '../src/config/env';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign(
  { userId: 'admin1', role: 'admin' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);

describe('Generations API', () => {
  let modelId: string;
  let generationId: string;

  beforeAll(async () => {
    await connectDB();
    await Brand.deleteMany({});
    await VehicleModel.deleteMany({});
    await Generation.deleteMany({});

    const brand = await Brand.create({
      brandCode: 'TG',
      name: 'Test Gen Brand',
      slug: 'test-gen-brand',
    });

    const model = await VehicleModel.create({
      brandId: brand._id,
      modelCode: 'TMG',
      name: 'Test Gen Model',
      slug: 'test-gen-model',
    });
    modelId = model._id.toString();
  });

  afterAll(async () => {
    await Generation.deleteMany({});
    await VehicleModel.deleteMany({});
    await Brand.deleteMany({});
    await disconnectDB();
  });

  it('should create a new generation', async () => {
    const res = await request(app)
      .post('/api/v1/generations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        modelId,
        generationCode: ' g1 ',
        name: ' Gen One ',
        startYear: 2010,
        endYear: 2015,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.generationCode).toBe('G1'); // Normalized
    expect(res.body.data.name).toBe('Gen One');
    expect(res.body.data.slug).toBe('gen-one');

    generationId = res.body.data._id;
  });

  it('should fail if endYear < startYear', async () => {
    const res = await request(app)
      .post('/api/v1/generations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        modelId,
        generationCode: 'G2',
        name: 'Gen Two',
        startYear: 2020,
        endYear: 2019,
      });

    expect(res.status).toBe(400); // Zod validation fails
    expect(res.body.errors[0].message).toContain(
      'endYear must be greater than or equal to startYear',
    );
  });

  it('should list generations by modelId', async () => {
    const res = await request(app).get(`/api/v1/models/${modelId}/generations?page=1&limit=10`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].generationCode).toBe('G1');
  });

  it('should soft delete a generation', async () => {
    const res = await request(app)
      .delete(`/api/v1/generations/${generationId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/v1/generations/${generationId}`);
    expect(check.body.data.status).toBe('inactive');
  });
});
