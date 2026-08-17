import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { VehicleModel } from '../src/modules/catalog/models/model.model';
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { Types } from 'mongoose';

describe('Car Compare API', () => {
  let v1Id: string;
  let v2Id: string;
  let v3Id: string;

  beforeAll(async () => {
    await connectDB();
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await VehicleModel.deleteMany({});
    await Brand.deleteMany({});

    const brand = await Brand.create({
      name: 'TestBrand',
      slug: 'test-brand',
      brandCode: 'TB',
    });

    const model = await VehicleModel.create({
      brandId: brand._id,
      name: 'TestModel',
      slug: 'test-model',
      modelCode: 'TM',
      bodyType: 'SUV',
      segment: 'C-Segment',
    });

    const generation = await Generation.create({
      modelId: model._id,
      name: 'Gen 1',
      slug: 'gen-1',
      generationCode: 'G1',
      startYear: 2020,
      endYear: 2024,
    });

    const v1 = await Variant.create({
      generationId: generation._id,
      variantCode: 'V1',
      name: 'Variant 1',
      slug: 'variant-1',
      fuelType: 'petrol',
      transmissionType: 'manual',
      status: 'active',
    });
    v1Id = v1._id.toString();

    const v2 = await Variant.create({
      generationId: generation._id,
      variantCode: 'V2',
      name: 'Variant 2',
      slug: 'variant-2',
      fuelType: 'diesel',
      transmissionType: 'automatic',
      status: 'active',
    });
    v2Id = v2._id.toString();

    const v3 = await Variant.create({
      generationId: generation._id,
      variantCode: 'V3',
      name: 'Variant 3',
      slug: 'variant-3',
      fuelType: 'electric',
      transmissionType: 'automatic',
      status: 'draft', // Draft should not be comparable!
    });
    v3Id = v3._id.toString();
  });

  afterAll(async () => {
    await Variant.deleteMany({});
    await Generation.deleteMany({});
    await VehicleModel.deleteMany({});
    await Brand.deleteMany({});
    await disconnectDB();
  });

  it('should compare two valid active variants', async () => {
    const res = await request(app).get(`/api/v1/cars/compare?variantIds=${v1Id},${v2Id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].slug).toBe('variant-1');
    expect(res.body.data[1].slug).toBe('variant-2');
  });

  it('should deduplicate same variant ID', async () => {
    const res = await request(app).get(`/api/v1/cars/compare?variantIds=${v1Id},${v1Id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1); // deduplicated
  });

  it('should fail if trying to compare more than 4 variants', async () => {
    const id1 = new Types.ObjectId().toString();
    const id2 = new Types.ObjectId().toString();
    const id3 = new Types.ObjectId().toString();
    const id4 = new Types.ObjectId().toString();
    const id5 = new Types.ObjectId().toString();

    const res = await request(app).get(`/api/v1/cars/compare?variantIds=${id1},${id2},${id3},${id4},${id5}`);
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors[0].message).toContain('more than 4 variants');
  });

  it('should fail if invalid object IDs are provided', async () => {
    const res = await request(app).get(`/api/v1/cars/compare?variantIds=invalid-id,${v1Id}`);
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors[0].message).toContain('invalid ObjectIds');
  });

  it('should return 404 if no variants are found (e.g. inactive variant)', async () => {
    const res = await request(app).get(`/api/v1/cars/compare?variantIds=${v3Id}`);
    
    expect(res.status).toBe(404);
  });
});
