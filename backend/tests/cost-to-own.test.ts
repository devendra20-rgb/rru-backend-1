import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { CostToOwn } from '../src/modules/catalog/cost-to-own/cost-to-own.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { Market } from '../src/modules/catalog/markets/market.model';
import { env } from '../src/config/env';
import jwt from 'jsonwebtoken';

const adminToken = jwt.sign(
  { userId: 'admin1', role: 'admin' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);

describe('CostToOwn API', () => {
  let variantId: string;
  let marketId: string;
  let costToOwnId: string;

  beforeAll(async () => {
    await connectDB();
    await CostToOwn.deleteMany({});
    await Variant.deleteMany({});
    await Market.deleteMany({});

    const variant = await Variant.create({
      generationId: '000000000000000000000000', // Mock ID
      variantCode: 'TEST-VARIANT',
      name: 'Test Variant',
      slug: 'test-variant',
      fuelType: 'petrol',
      transmissionType: 'automatic',
    });
    variantId = variant._id.toString();

    const market = await Market.create({
      code: 'US',
      countryCode: 'US',
      name: 'United States',
      currencyCode: 'USD',
      currencySymbol: '$',
    });
    marketId = market._id.toString();
  });

  afterAll(async () => {
    await CostToOwn.deleteMany({});
    await Variant.deleteMany({});
    await Market.deleteMany({});
    await disconnectDB();
  });

  it('should create CostToOwn record', async () => {
    const res = await request(app)
      .post('/api/v1/cost-to-own')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantId,
        marketId,
        fuelCostAssumptions: 1500,
        insurance: 1200,
        maintenance: 500,
        ownershipPeriod: 60,
        totalEstimatedCost: 16000,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fuelCostAssumptions).toBe(1500);

    costToOwnId = res.body.data._id;
  });

  it('should prevent duplicate CostToOwn for same variant+market', async () => {
    const res = await request(app)
      .post('/api/v1/cost-to-own')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantId,
        marketId,
        ownershipPeriod: 60,
      });

    expect(res.status).toBe(409);
  });

  it('should fetch CostToOwn records publicly', async () => {
    const res = await request(app).get(`/api/v1/cost-to-own?variantId=${variantId}&marketId=${marketId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].totalEstimatedCost).toBe(16000);
  });

  it('should update CostToOwn record', async () => {
    const res = await request(app)
      .patch(`/api/v1/cost-to-own/${costToOwnId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        insurance: 1300,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.insurance).toBe(1300);
  });

  it('should soft delete CostToOwn record', async () => {
    const res = await request(app)
      .delete(`/api/v1/cost-to-own/${costToOwnId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/v1/cost-to-own/${costToOwnId}`);
    expect(check.body.data.status).toBe('inactive');
  });
});
