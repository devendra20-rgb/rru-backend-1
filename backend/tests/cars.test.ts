import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env';

// Models
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { VehicleModel } from '../src/modules/catalog/models/model.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { Market } from '../src/modules/catalog/markets/market.model';
import { VariantMarket } from '../src/modules/catalog/variant-markets/variant-market.model';
import { Media } from '../src/modules/media/media.model';
import { Specification } from '../src/modules/catalog/specifications/specification.model';
import { Feature, VariantFeature } from '../src/modules/catalog/features/feature.model';
import { Color, VariantColor } from '../src/modules/catalog/colors/color.model';

describe('Public Cars API', () => {
  let brandId: string;
  let modelId: string;
  let generationId: string;
  let variantId: string;
  let marketId: string;

  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI);

    // Clear db
    await Brand.deleteMany({});
    await VehicleModel.deleteMany({});
    await Generation.deleteMany({});
    await Variant.deleteMany({});
    await Market.deleteMany({});
    await VariantMarket.deleteMany({});
    await Media.deleteMany({});
    await Specification.deleteMany({});
    await Feature.deleteMany({});
    await VariantFeature.deleteMany({});
    await Color.deleteMany({});
    await VariantColor.deleteMany({});

    // Create hierarchy
    const brand = await Brand.create({
      brandCode: 'PUB_BRAND',
      name: 'Public Brand',
      slug: 'public-brand',
    });
    brandId = brand._id.toString();

    const model = await VehicleModel.create({
      brandId,
      modelCode: 'PUB_MODEL',
      name: 'Public Model',
      slug: 'public-model',
      status: 'active',
    });
    modelId = model._id.toString();

    const gen = await Generation.create({
      modelId,
      generationCode: 'PUB_GEN',
      name: 'Public Gen',
      slug: 'public-gen',
      status: 'active',
    });
    generationId = gen._id.toString();

    const variant = await Variant.create({
      generationId,
      variantCode: 'PUB_VAR',
      name: 'Public Variant',
      slug: 'public-variant',
      fuelType: 'electric',
      modelYear: 2026,
      status: 'active', // Important: Must be active for public API
    });
    variantId = variant._id.toString();

    const market = await Market.create({
      name: 'Global Market',
      code: 'GLB',
      countryCode: 'US',
      currencyCode: 'USD',
      status: 'active',
    });
    marketId = market._id.toString();

    await VariantMarket.create({
      variantId,
      marketId,
      availabilityStatus: 'available',
      status: 'active',
      isFeatured: true,
      pricing: {
        amount: 49999,
        currencyCode: 'USD',
        priceType: 'msrp',
      },
    });

    await Media.create({
      entityType: 'variant',
      entityId: variantId,
      mediaType: 'image',
      storageProvider: 'local',
      storageKey: 'public/primary.jpg',
      url: '/uploads/primary.jpg',
      originalName: 'primary.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      isPrimary: true,
      status: 'active',
    });

    await Specification.create({
      variantId,
      performance: { topSpeedKph: 200 },
      dimensions: { lengthMm: 4500 },
    });

    const feature = await Feature.create({
      name: 'Sunroof',
      slug: 'sunroof',
      category: 'exterior',
      status: 'active',
    });

    await VariantFeature.create({
      variantId,
      featureId: feature._id,
      availability: 'standard',
      status: 'active',
    });

    const color = await Color.create({
      name: 'Red',
      slug: 'red',
      hexCode: '#FF0000',
      type: 'exterior',
      status: 'active',
    });

    await VariantColor.create({
      variantId,
      colorId: color._id,
      availability: 'optional',
      status: 'active',
    });
  });

  afterAll(async () => {
    await Brand.deleteMany({});
    await VehicleModel.deleteMany({});
    await Generation.deleteMany({});
    await Variant.deleteMany({});
    await Market.deleteMany({});
    await VariantMarket.deleteMany({});
    await Media.deleteMany({});
    await Specification.deleteMany({});
    await Feature.deleteMany({});
    await VariantFeature.deleteMany({});
    await Color.deleteMany({});
    await VariantColor.deleteMany({});
    await mongoose.disconnect();
  });

  describe('GET /api/v1/cars', () => {
    it('should list active cars successfully', async () => {
      const res = await request(app).get('/api/v1/cars');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);

      const car = res.body.data[0];
      expect(car.name).toBe('Public Variant');
      expect(car.brand.name).toBe('Public Brand');
      expect(car.model.name).toBe('Public Model');
      expect(car.generation.name).toBe('Public Gen');
      expect(car.primaryMedia.url).toBe('/uploads/primary.jpg');
      expect(car.pricing.amount).toBe(49999);
    });

    it('should filter by brandId', async () => {
      const res = await request(app).get(`/api/v1/cars?brandId=${brandId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should return empty for non-matching brandId', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).get(`/api/v1/cars?brandId=${fakeId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('should filter by marketId', async () => {
      const res = await request(app).get(`/api/v1/cars?marketId=${marketId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should filter by price range', async () => {
      const res = await request(app).get('/api/v1/cars?priceMin=40000&priceMax=50000');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      
      const res2 = await request(app).get('/api/v1/cars?priceMin=50000');
      expect(res2.status).toBe(200);
      expect(res2.body.data.length).toBe(0);
    });

    it('should search by brand name', async () => {
      const res = await request(app).get('/api/v1/cars?search=Public Brand');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should search by model name', async () => {
      const res = await request(app).get('/api/v1/cars?search=Public Model');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should search by generation name', async () => {
      const res = await request(app).get('/api/v1/cars?search=Public Gen');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should return empty for non-matching search', async () => {
      const res = await request(app).get('/api/v1/cars?search=NonExistentTerm');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('GET /api/v1/cars/featured', () => {
    it('should list featured cars successfully', async () => {
      const res = await request(app).get('/api/v1/cars/featured');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Public Variant');
    });

    it('should filter featured cars by marketId', async () => {
      const res = await request(app).get(`/api/v1/cars/featured?marketId=${marketId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/v1/cars/:slug', () => {
    it('should get detail of active car', async () => {
      const res = await request(app).get('/api/v1/cars/public-variant');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const car = res.body.data;
      expect(car.name).toBe('Public Variant');
      expect(car.brand.name).toBe('Public Brand');
      expect(car.model.name).toBe('Public Model');
      expect(car.media.length).toBe(1);
      expect(car.markets.length).toBe(1);
      expect(car.specifications.performance.topSpeedKph).toBe(200);
      expect(car.features.length).toBe(1);
      expect(car.features[0].name).toBe('Sunroof');
      expect(car.colors.length).toBe(1);
      expect(car.colors[0].name).toBe('Red');
    });

    it('should return 404 for unknown slug', async () => {
      const res = await request(app).get('/api/v1/cars/unknown-slug');
      expect(res.status).toBe(404);
    });
  });
});
