import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { VehicleModel } from '../src/modules/catalog/models/model.model';
import { env } from '../src/config/env';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign({ userId: 'admin1', role: 'admin' }, env.JWT_ACCESS_SECRET || 'test_secret', { expiresIn: '1h' });

describe('Models API', () => {
  let brandId: string;
  let modelId: string;

  beforeAll(async () => {
    await connectDB();
    await Brand.deleteMany({});
    await VehicleModel.deleteMany({});

    // Create a brand for models to reference
    const brand = await Brand.create({
      brandCode: 'TST',
      name: 'Test Brand',
      slug: 'test-brand',
    });
    brandId = brand._id.toString();
  });

  afterAll(async () => {
    await VehicleModel.deleteMany({});
    await Brand.deleteMany({});
    await disconnectDB();
  });

  it('should create a new model', async () => {
    const res = await request(app)
      .post('/api/v1/models')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        brandId,
        modelCode: ' m1 ',
        name: ' Model One ',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.modelCode).toBe('M1'); // Normalized
    expect(res.body.data.name).toBe('Model One'); // Trimmed
    expect(res.body.data.slug).toBe('model-one');
    
    modelId = res.body.data._id;
  });

  it('should fail with invalid brandId reference', async () => {
    const res = await request(app)
      .post('/api/v1/models')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        brandId: '123456789012345678901234', // Non-existent but valid ObjectId
        modelCode: 'M2',
        name: 'Model Two',
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Referenced Brand does not exist');
  });

  it('should fail to create model with duplicate code globally', async () => {
    const res = await request(app)
      .post('/api/v1/models')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        brandId,
        modelCode: 'M1',
        name: 'Another Model',
      });

    expect(res.status).toBe(409);
  });

  it('should list models by brandId', async () => {
    const res = await request(app).get(`/api/v1/brands/${brandId}/models?page=1&limit=10`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].modelCode).toBe('M1');
  });

  it('should soft delete a model', async () => {
    const res = await request(app)
      .delete(`/api/v1/models/${modelId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    
    const check = await request(app).get(`/api/v1/models/${modelId}`);
    expect(check.body.data.status).toBe('inactive');
  });
});
