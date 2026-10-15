import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';

// Models
import { Brand } from '../src/modules/catalog/brands/brand.model';
import { VehicleModel } from '../src/modules/catalog/models/model.model';
import { Generation } from '../src/modules/catalog/generations/generation.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { Feature, VariantFeature } from '../src/modules/catalog/features/feature.model';
import { Color, VariantColor } from '../src/modules/catalog/colors/color.model';
import { variantFeatureRepository } from '../src/modules/catalog/features/feature.repository';
import { variantColorRepository } from '../src/modules/catalog/colors/color.repository';

describe('Car Features & Colors Backward-Compatible Read Fallback', () => {
  // Track all IDs for surgical cleanup (NON-DESTRUCTIVE to existing database records)
  const trackedBrandIds: Types.ObjectId[] = [];
  const trackedModelIds: Types.ObjectId[] = [];
  const trackedGenIds: Types.ObjectId[] = [];
  const trackedVariantIds: Types.ObjectId[] = [];
  const trackedFeatureIds: Types.ObjectId[] = [];
  const trackedColorIds: Types.ObjectId[] = [];

  let testBrandId: Types.ObjectId;
  let testModelId: Types.ObjectId;
  let testGenId: Types.ObjectId;

  // Master Features
  let featureA: any;
  let featureB: any;
  let featureC: any;

  // Master Colors
  let colorRed: any;
  let colorBlue: any;
  let colorGreen: any;

  // Variants under test
  let legacyOnlyVariant: any;
  let embeddedOnlyVariant: any;
  let mixedSchemaVariant: any;
  let emptyVariant: any;
  let missingMasterRefVariant: any;
  let independentVariant: any;

  beforeAll(async () => {
    await connectDB();

    // 1. Create dedicated hierarchy
    const brand = await Brand.create({
      brandCode: `FB_BRAND_${Date.now()}`,
      name: 'Fallback Brand',
      slug: `fallback-brand-${Date.now()}`,
      status: 'active',
    });
    testBrandId = brand._id;
    trackedBrandIds.push(brand._id);

    const model = await VehicleModel.create({
      brandId: testBrandId,
      modelCode: `FB_MODEL_${Date.now()}`,
      name: 'Fallback Model',
      slug: `fallback-model-${Date.now()}`,
      status: 'active',
    });
    testModelId = model._id;
    trackedModelIds.push(model._id);

    const gen = await Generation.create({
      modelId: testModelId,
      generationCode: `FB_GEN_${Date.now()}`,
      name: 'Fallback Gen',
      slug: `fallback-gen-${Date.now()}`,
      status: 'active',
    });
    testGenId = gen._id;
    trackedGenIds.push(gen._id);

    // 2. Create Master Features
    featureA = await Feature.create({
      name: `Anti-lock Brakes ${Date.now()}`,
      slug: `abs-${Date.now()}`,
      category: 'safety',
      status: 'active',
    });
    trackedFeatureIds.push(featureA._id);

    featureB = await Feature.create({
      name: `Sunroof Panoramic ${Date.now()}`,
      slug: `sunroof-${Date.now()}`,
      category: 'exterior',
      status: 'active',
    });
    trackedFeatureIds.push(featureB._id);

    featureC = await Feature.create({
      name: `Wireless Charger ${Date.now()}`,
      slug: `charger-${Date.now()}`,
      category: 'comfort',
      status: 'active',
    });
    trackedFeatureIds.push(featureC._id);

    // 3. Create Master Colors
    colorRed = await Color.create({
      name: `Crimson Red ${Date.now()}`,
      slug: `red-${Date.now()}`,
      hexCode: '#FF0000',
      type: 'exterior',
      finishType: 'metallic',
      status: 'active',
    });
    trackedColorIds.push(colorRed._id);

    colorBlue = await Color.create({
      name: `Ocean Blue ${Date.now()}`,
      slug: `blue-${Date.now()}`,
      hexCode: '#0000FF',
      type: 'exterior',
      finishType: 'gloss',
      status: 'active',
    });
    trackedColorIds.push(colorBlue._id);

    colorGreen = await Color.create({
      name: `Forest Green ${Date.now()}`,
      slug: `green-${Date.now()}`,
      hexCode: '#00FF00',
      type: 'exterior',
      finishType: 'matte',
      status: 'active',
    });
    trackedColorIds.push(colorGreen._id);

    // 4. Test Variant 1: Legacy-Only (mimics older production cars like Q7)
    // Variant has features: undefined, colors: undefined
    legacyOnlyVariant = await Variant.create({
      modelId: testModelId,
      generationId: testGenId,
      variantCode: `FB_LEGACY_${Date.now()}`,
      name: 'Legacy Only Car',
      slug: `legacy-only-car-${Date.now()}`,
      fuelType: 'petrol',
      modelYear: 2024,
      status: 'active',
    });
    trackedVariantIds.push(legacyOnlyVariant._id);

    // Legacy junction records
    await VariantFeature.create([
      {
        variantId: legacyOnlyVariant._id,
        featureId: featureA._id,
        availability: 'standard',
        status: 'active',
      },
      {
        variantId: legacyOnlyVariant._id,
        featureId: featureB._id,
        availability: 'optional',
        status: 'active',
      },
    ]);

    await VariantColor.create([
      {
        variantId: legacyOnlyVariant._id,
        colorId: colorRed._id,
        availability: 'standard',
        isBaseColor: true,
        extraPrice: 0,
        status: 'active',
      },
      {
        variantId: legacyOnlyVariant._id,
        colorId: colorBlue._id,
        availability: 'optional',
        isBaseColor: false,
        extraPrice: 1500,
        status: 'active',
      },
    ]);

    // 5. Test Variant 2: Embedded-Only (mimics cars added yesterday)
    embeddedOnlyVariant = await Variant.create({
      modelId: testModelId,
      generationId: testGenId,
      variantCode: `FB_EMB_${Date.now()}`,
      name: 'Embedded Only Car',
      slug: `embedded-only-car-${Date.now()}`,
      fuelType: 'electric',
      modelYear: 2026,
      status: 'active',
      features: {
        standard: [featureA._id],
        optional: [featureC._id],
      },
      colors: [
        {
          colorId: colorGreen._id,
          imageUrl: 'https://example.com/green.jpg',
          isBaseColor: true,
          extraPrice: 0,
          status: 'active',
        },
      ],
    });
    trackedVariantIds.push(embeddedOnlyVariant._id);

    // 6. Test Variant 3: Mixed-Schema (has embedded data AND legacy records with overlap)
    mixedSchemaVariant = await Variant.create({
      modelId: testModelId,
      generationId: testGenId,
      variantCode: `FB_MIX_${Date.now()}`,
      name: 'Mixed Schema Car',
      slug: `mixed-schema-car-${Date.now()}`,
      fuelType: 'hybrid',
      modelYear: 2025,
      status: 'active',
      features: {
        standard: [featureA._id], // featureA is embedded standard
        optional: [],
      },
      colors: [
        {
          colorId: colorRed._id, // colorRed is embedded
          isBaseColor: true,
          extraPrice: 0,
          status: 'active',
        },
      ],
    });
    trackedVariantIds.push(mixedSchemaVariant._id);

    // In legacy: featureA (duplicate) + featureB (new legacy)
    await VariantFeature.create([
      {
        variantId: mixedSchemaVariant._id,
        featureId: featureA._id,
        availability: 'optional', // note: embedded has standard, embedded should win
        status: 'active',
      },
      {
        variantId: mixedSchemaVariant._id,
        featureId: featureB._id,
        availability: 'optional',
        status: 'active',
      },
    ]);

    // In legacy: colorRed (duplicate) + colorBlue (new legacy)
    await VariantColor.create([
      {
        variantId: mixedSchemaVariant._id,
        colorId: colorRed._id,
        availability: 'optional',
        status: 'active',
      },
      {
        variantId: mixedSchemaVariant._id,
        colorId: colorBlue._id,
        availability: 'optional',
        extraPrice: 500,
        status: 'active',
      },
    ]);

    // 7. Test Variant 4: Empty (no features or colors in either schema)
    emptyVariant = await Variant.create({
      modelId: testModelId,
      generationId: testGenId,
      variantCode: `FB_EMPTY_${Date.now()}`,
      name: 'Empty Car',
      slug: `empty-car-${Date.now()}`,
      fuelType: 'diesel',
      modelYear: 2023,
      status: 'active',
      features: {
        standard: [],
        optional: [],
      },
      colors: [],
    });
    trackedVariantIds.push(emptyVariant._id);

    // 8. Test Variant 5: Missing Master References (orphaned references in both embedded and legacy)
    const nonExistentFeatureId = new Types.ObjectId();
    const nonExistentColorId = new Types.ObjectId();

    missingMasterRefVariant = await Variant.create({
      modelId: testModelId,
      generationId: testGenId,
      variantCode: `FB_ORPHAN_${Date.now()}`,
      name: 'Orphan Ref Car',
      slug: `orphan-ref-car-${Date.now()}`,
      fuelType: 'petrol',
      modelYear: 2024,
      status: 'active',
      features: {
        standard: [featureA._id, nonExistentFeatureId], // one valid, one orphan
        optional: [],
      },
      colors: [
        {
          colorId: nonExistentColorId, // orphan color
          isBaseColor: true,
          status: 'active',
        },
      ],
    });
    trackedVariantIds.push(missingMasterRefVariant._id);

    // Orphan legacy records
    await VariantFeature.create({
      variantId: missingMasterRefVariant._id,
      featureId: new Types.ObjectId(), // non-existent
      availability: 'standard',
      status: 'active',
    });

    await VariantColor.create({
      variantId: missingMasterRefVariant._id,
      colorId: new Types.ObjectId(), // non-existent
      availability: 'standard',
      status: 'active',
    });

    // 9. Test Variant 6: Independent Fallback (Embedded Features + Legacy Colors)
    independentVariant = await Variant.create({
      modelId: testModelId,
      generationId: testGenId,
      variantCode: `FB_INDEP_${Date.now()}`,
      name: 'Independent Car',
      slug: `independent-car-${Date.now()}`,
      fuelType: 'petrol',
      modelYear: 2025,
      status: 'active',
      features: {
        standard: [featureC._id], // embedded features
        optional: [],
      },
      // colors is undefined on variant
    });
    trackedVariantIds.push(independentVariant._id);

    await VariantColor.create({
      variantId: independentVariant._id,
      colorId: colorBlue._id, // legacy color
      availability: 'standard',
      isBaseColor: true,
      status: 'active',
    });
  }, 30000);

  afterAll(async () => {
    // Surgical cleanup: ONLY delete records created by this test suite
    await VariantFeature.deleteMany({ variantId: { $in: trackedVariantIds } });
    await VariantColor.deleteMany({ variantId: { $in: trackedVariantIds } });
    await Variant.deleteMany({ _id: { $in: trackedVariantIds } });
    await Generation.deleteMany({ _id: { $in: trackedGenIds } });
    await VehicleModel.deleteMany({ _id: { $in: trackedModelIds } });
    await Brand.deleteMany({ _id: { $in: trackedBrandIds } });
    await Feature.deleteMany({ _id: { $in: trackedFeatureIds } });
    await Color.deleteMany({ _id: { $in: trackedColorIds } });
    await disconnectDB();
  });

  describe('1. Legacy-Only Records (Older Production Cars)', () => {
    it('should retrieve legacy features and colors via public API fallback', async () => {
      const res = await request(app).get(`/api/v1/vehicles/slug/${legacyOnlyVariant.slug}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const car = res.body.data;
      expect(car.name).toBe('Legacy Only Car');

      // Verify features fallback populated from variantfeatures
      expect(car.features).toBeDefined();
      expect(car.features.length).toBe(2);

      const stdFeature = car.features.find((f: any) => f.name === featureA.name);
      expect(stdFeature).toBeDefined();
      expect(stdFeature.availability).toBe('standard');
      expect(stdFeature.category).toBe('safety');

      const optFeature = car.features.find((f: any) => f.name === featureB.name);
      expect(optFeature).toBeDefined();
      expect(optFeature.availability).toBe('optional');
      expect(optFeature.category).toBe('exterior');

      // Verify colors fallback populated from variantcolors
      expect(car.colors).toBeDefined();
      expect(car.colors.length).toBe(2);

      const red = car.colors.find((c: any) => c.name === colorRed.name);
      expect(red).toBeDefined();
      expect(red.hexCode).toBe('#FF0000');
      expect(red.availability).toBe('standard');

      const blue = car.colors.find((c: any) => c.name === colorBlue.name);
      expect(blue).toBeDefined();
      expect(blue.hexCode).toBe('#0000FF');
      expect(blue.availability).toBe('optional');
    });
  });

  describe('2. Embedded-Only Records (Cars Added Recently)', () => {
    it('should retrieve embedded features and colors without alteration', async () => {
      const res = await request(app).get(`/api/v1/vehicles/slug/${embeddedOnlyVariant.slug}`);
      expect(res.status).toBe(200);

      const car = res.body.data;
      expect(car.features.length).toBe(2);

      const stdFeature = car.features.find((f: any) => f.name === featureA.name);
      expect(stdFeature).toBeDefined();
      expect(stdFeature.availability).toBe('standard');

      const optFeature = car.features.find((f: any) => f.name === featureC.name);
      expect(optFeature).toBeDefined();
      expect(optFeature.availability).toBe('optional');

      expect(car.colors.length).toBe(1);
      expect(car.colors[0].name).toBe(colorGreen.name);
      expect(car.colors[0].hexCode).toBe('#00FF00');
    });
  });

  describe('3. Mixed-Schema Records (Deduplication & Precedence)', () => {
    it('should prioritize embedded records and add non-duplicate legacy records without duplicates', async () => {
      const res = await request(app).get(`/api/v1/vehicles/slug/${mixedSchemaVariant.slug}`);
      expect(res.status).toBe(200);

      const car = res.body.data;

      // FeatureA is in embedded as standard, in legacy as optional.
      // FeatureB is only in legacy as optional.
      // Expected: 2 features total (no duplicate featureA), featureA has standard (embedded wins).
      expect(car.features.length).toBe(2);

      const featA = car.features.find((f: any) => f.name === featureA.name);
      expect(featA).toBeDefined();
      expect(featA.availability).toBe('standard'); // Embedded precedence

      const featB = car.features.find((f: any) => f.name === featureB.name);
      expect(featB).toBeDefined();
      expect(featB.availability).toBe('optional');

      // Duplicate check
      const names = car.features.map((f: any) => f.name);
      expect(new Set(names).size).toBe(names.length);

      // ColorRed is in embedded, ColorBlue is in legacy.
      // Expected: 2 colors total (no duplicate colorRed).
      expect(car.colors.length).toBe(2);
      const colRed = car.colors.find((c: any) => c.name === colorRed.name);
      expect(colRed).toBeDefined();
      const colBlue = car.colors.find((c: any) => c.name === colorBlue.name);
      expect(colBlue).toBeDefined();

      const colorNames = car.colors.map((c: any) => c.name);
      expect(new Set(colorNames).size).toBe(colorNames.length);
    });
  });

  describe('4. Empty Arrays Handling', () => {
    it('should return empty arrays gracefully without crashing or throwing', async () => {
      const res = await request(app).get(`/api/v1/vehicles/slug/${emptyVariant.slug}`);
      expect(res.status).toBe(200);

      const car = res.body.data;
      expect(Array.isArray(car.features)).toBe(true);
      expect(car.features.length).toBe(0);
      expect(Array.isArray(car.colors)).toBe(true);
      expect(car.colors.length).toBe(0);
    });
  });

  describe('5. Missing Master References (Orphan Tolerance)', () => {
    it('should safely ignore non-existent master references and return only valid populated items', async () => {
      const res = await request(app).get(`/api/v1/vehicles/slug/${missingMasterRefVariant.slug}`);
      expect(res.status).toBe(200);

      const car = res.body.data;
      // Should contain only valid featureA, orphan feature is dropped
      expect(car.features.length).toBe(1);
      expect(car.features[0].name).toBe(featureA.name);

      // Orphan color should be dropped
      expect(car.colors.length).toBe(0);
    });
  });

  describe('6. Independent Feature and Color Fallback', () => {
    it('should fallback color independently without replacing valid embedded features', async () => {
      const res = await request(app).get(`/api/v1/vehicles/slug/${independentVariant.slug}`);
      expect(res.status).toBe(200);

      const car = res.body.data;
      // Embedded feature preserved
      expect(car.features.length).toBe(1);
      expect(car.features[0].name).toBe(featureC.name);

      // Legacy color retrieved
      expect(car.colors.length).toBe(1);
      expect(car.colors[0].name).toBe(colorBlue.name);
    });
  });

  describe('7. Repository Level Fallback (findByVariantId)', () => {
    it('variantFeatureRepository.findByVariantId should return legacy features when embedded is absent', async () => {
      const features = await variantFeatureRepository.findByVariantId(legacyOnlyVariant._id.toString());
      expect(features.length).toBeGreaterThan(0);

      const std = features.find((f: any) => f.featureId?.name === featureA.name);
      expect(std).toBeDefined();
      expect(std?.availability).toBe('standard');

      const opt = features.find((f: any) => f.featureId?.name === featureB.name);
      expect(opt).toBeDefined();
      expect(opt?.availability).toBe('optional');
    });

    it('variantColorRepository.findByVariantId should return legacy colors when embedded is absent', async () => {
      const colors = await variantColorRepository.findByVariantId(legacyOnlyVariant._id.toString());
      expect(colors.length).toBe(2);

      const red = colors.find((c: any) => c.colorId?.name === colorRed.name);
      expect(red).toBeDefined();
      expect(red?.availability).toBe('standard');

      const blue = colors.find((c: any) => c.colorId?.name === colorBlue.name);
      expect(blue).toBeDefined();
      expect(blue?.availability).toBe('optional');
    });
  });
});
