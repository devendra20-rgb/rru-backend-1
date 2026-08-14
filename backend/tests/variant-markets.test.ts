import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { VehicleModel as Model } from '../src/modules/catalog/models/model.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { Market } from '../src/modules/catalog/markets/market.model';
import { VariantMarket } from '../src/modules/catalog/variant-markets/variant-market.model';
import { generateAccessToken } from '../src/utils/jwt';

describe('Variant Markets API', () => {
  let adminToken: string;
  let variantId: string;
  let marketId: string;
  let variantMarketId: string;

  beforeAll(async () => {
    await connectDB();
    adminToken = generateAccessToken({ userId: 'admin1', role: 'admin' });

    await VariantMarket.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});
    await Market.deleteMany({});

    const brand = await Brand.create({ brandCode: 'TESTBRAND', name: 'Test Brand', slug: 'test-brand', status: 'active' });
    const model = await Model.create({ brandId: brand._id, modelCode: 'TESTMODEL', name: 'Test Model', slug: 'test-model', status: 'active' });
    const generation = await Generation.create({ modelId: model._id, generationCode: 'TESTGEN', name: 'Test Gen', slug: 'test-gen', startYear: 2020, status: 'active' });
    
    const variant = await Variant.create({
      generationId: generation._id,
      variantCode: 'TESTVAR',
      name: 'Test Variant',
      slug: 'test-variant',
      fuelType: 'petrol',
      transmissionType: 'automatic',
      drivetrain: 'awd',
      status: 'active',
    });
    variantId = variant._id.toString();

    const market = await Market.create({
      code: 'US',
      name: 'United States',
      countryCode: 'US',
      currencyCode: 'USD',
      currencySymbol: '$',
      status: 'active',
    });
    marketId = market._id.toString();
  });

  afterAll(async () => {
    await VariantMarket.deleteMany({});
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await Model.deleteMany({});
    await Brand.deleteMany({});
    await Market.deleteMany({});
    await disconnectDB();
  });

  it('should create a variant market relationship', async () => {
    const res = await request(app)
      .post('/api/v1/variant-markets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantId,
        marketId,
        availabilityStatus: 'available',
        status: 'active',
        launchDate: '2023-01-01T00:00:00.000Z',
        pricing: {
          amount: 50000,
          currencyCode: 'USD',
          priceType: 'msrp',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.variantId).toBe(variantId);
    expect(res.body.data.marketId).toBe(marketId);
    expect(res.body.data.pricing.amount).toBe(50000);
    variantMarketId = res.body.data._id;
  });

  it('should not allow duplicate variant-market mappings', async () => {
    const res = await request(app)
      .post('/api/v1/variant-markets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantId,
        marketId,
        availabilityStatus: 'upcoming',
        pricing: {
          amount: 55000,
          currencyCode: 'USD',
          priceType: 'msrp',
        },
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should validate discontinuedDate cannot be before launchDate', async () => {
    const market2 = await Market.create({
      code: 'CA',
      name: 'Canada',
      countryCode: 'CA',
      currencyCode: 'CAD',
      status: 'active',
    });

    const res = await request(app)
      .post('/api/v1/variant-markets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantId,
        marketId: market2._id.toString(),
        launchDate: '2024-01-01T00:00:00.000Z',
        discontinuedDate: '2023-01-01T00:00:00.000Z',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should get all variant markets', async () => {
    const res = await request(app).get('/api/v1/variant-markets');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].variantId._id.toString()).toBe(variantId);
  });

  it('should get nested markets for a variant', async () => {
    const res = await request(app).get(`/api/v1/variants/${variantId}/markets`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].marketId._id.toString()).toBe(marketId);
  });

  it('should get nested variants for a market', async () => {
    const res = await request(app).get(`/api/v1/markets/${marketId}/variants`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].variantId._id.toString()).toBe(variantId);
  });

  it('should update a variant market pricing', async () => {
    const res = await request(app)
      .patch(`/api/v1/variant-markets/${variantMarketId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        pricing: {
          amount: 52000,
          currencyCode: 'USD',
          priceType: 'msrp',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pricing.amount).toBe(52000);
  });

  it('should soft delete by setting status to inactive', async () => {
    const res = await request(app)
      .delete(`/api/v1/variant-markets/${variantMarketId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    
    // Fetch it to verify status is inactive
    const checkRes = await request(app).get(`/api/v1/variant-markets/${variantMarketId}`);
    expect(checkRes.body.data.status).toBe('inactive');
  });
});
