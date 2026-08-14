import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { Market } from '../src/modules/catalog/markets/market.model';
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

describe('Markets API', () => {
  beforeAll(async () => {
    await connectDB();
    await Market.deleteMany({});
  });

  afterAll(async () => {
    await Market.deleteMany({});
    await disconnectDB();
  });

  let marketId: string;

  describe('POST /api/v1/markets', () => {
    it('should create a new market', async () => {
      const res = await request(app)
        .post('/api/v1/markets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: ' uae ',
          name: 'United Arab Emirates',
          countryCode: ' ae ',
          currencyCode: ' aed ',
          currencySymbol: 'د.إ',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('UAE');
      expect(res.body.data.countryCode).toBe('AE');
      expect(res.body.data.currencyCode).toBe('AED');
      expect(res.body.data.status).toBe('draft');

      marketId = res.body.data._id;
    });

    it('should reject duplicate market code', async () => {
      const res = await request(app)
        .post('/api/v1/markets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'UAE',
          name: 'Duplicate UAE',
          countryCode: 'AE',
          currencyCode: 'AED',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject creation without admin token', async () => {
      const res = await request(app)
        .post('/api/v1/markets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          code: 'USA',
          name: 'United States',
          countryCode: 'US',
          currencyCode: 'USD',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/markets', () => {
    beforeAll(async () => {
      // Add another market
      await request(app).post('/api/v1/markets').set('Authorization', `Bearer ${adminToken}`).send({
        code: 'KSA',
        name: 'Saudi Arabia',
        countryCode: 'SA',
        currencyCode: 'SAR',
      });
    });

    it('should list markets with pagination', async () => {
      const res = await request(app).get('/api/v1/markets?limit=10');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(2);
    });

    it('should filter markets by search', async () => {
      const res = await request(app).get('/api/v1/markets?search=Saudi');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].code).toBe('KSA');
    });

    it('should filter markets by countryCode', async () => {
      const res = await request(app).get('/api/v1/markets?countryCode=ae');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].code).toBe('UAE');
    });
  });

  describe('GET /api/v1/markets/:id', () => {
    it('should get a market by id', async () => {
      const res = await request(app).get(`/api/v1/markets/${marketId}`);
      expect(res.status).toBe(200);
      expect(res.body.data._id).toBe(marketId);
    });

    it('should return 400 for invalid id format', async () => {
      const res = await request(app).get(`/api/v1/markets/invalid-id`);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/markets/code/:code', () => {
    it('should get a market by code', async () => {
      const res = await request(app).get(`/api/v1/markets/code/uae`);
      expect(res.status).toBe(200);
      expect(res.body.data.code).toBe('UAE');
    });
  });

  describe('PATCH /api/v1/markets/:id', () => {
    it('should update a market', async () => {
      const res = await request(app)
        .patch(`/api/v1/markets/${marketId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'active',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('active');
    });
  });

  describe('DELETE /api/v1/markets/:id', () => {
    it('should soft delete a market', async () => {
      const res = await request(app)
        .delete(`/api/v1/markets/${marketId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verify it's inactive
      const getRes = await request(app).get(`/api/v1/markets/${marketId}`);
      expect(getRes.body.data.status).toBe('inactive');
    });
  });
});
