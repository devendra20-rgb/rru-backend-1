import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { env } from '../src/config/env';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign(
  { userId: 'admin1', role: 'admin' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);
const userToken = jwt.sign(
  { userId: 'user1', role: 'user' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);

describe('Brands API', () => {
  beforeAll(async () => {
    await connectDB();
    await Brand.deleteMany({});
  });

  afterAll(async () => {
    await Brand.deleteMany({});
    await disconnectDB();
  });

  let brandId: string;

  it('should create a new brand (normalized)', async () => {
    const res = await request(app)
      .post('/api/v1/brands')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        brandCode: ' toy ',
        name: ' Toyota ',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.brandCode).toBe('TOY'); // Normalized uppercase trimmed
    expect(res.body.data.name).toBe('Toyota'); // Trimmed
    expect(res.body.data.slug).toBe('toyota');
    expect(res.body.data.status).toBe('active');

    brandId = res.body.data._id;
  });

  it('should fail to create brand with duplicate code', async () => {
    const res = await request(app)
      .post('/api/v1/brands')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        brandCode: 'TOY',
        name: 'Another Toyota',
      });

    expect(res.status).toBe(409);
  });

  it('should list brands with pagination', async () => {
    await request(app).post('/api/v1/brands').set('Authorization', `Bearer ${adminToken}`).send({
      brandCode: 'HON',
      name: 'Honda',
    });

    const res = await request(app).get('/api/v1/brands?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
  });

  it('should fail if user is not authorized', async () => {
    const res = await request(app)
      .post('/api/v1/brands')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        brandCode: 'FORD',
        name: 'Ford',
      });

    expect(res.status).toBe(403);
  });

  it('should fail with invalid object id for GET /:id', async () => {
    const res = await request(app).get('/api/v1/brands/invalid-id');
    expect(res.status).toBe(400); // Zod validation
  });

  it('should soft delete (deactivate) a brand', async () => {
    const res = await request(app)
      .delete(`/api/v1/brands/${brandId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/v1/brands/${brandId}`);
    expect(check.body.data.status).toBe('inactive');
  });
});
