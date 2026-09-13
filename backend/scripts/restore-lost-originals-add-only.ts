/**
 * Restore ORIGINAL lost catalog items we can prove existed
 * (from pre-wipe audits + seed-production-data), ADD-ONLY.
 *
 * Cannot restore: exact old ObjectIds, uploaded media binaries,
 * dashboard draft junk (xxx/211), or Atlas-only data without a backup.
 *
 * Run: npx tsx scripts/restore-lost-originals-add-only.ts
 */
import 'dotenv/config';
import mongoose, { Types } from 'mongoose';

type VariantSpec = {
  variantCode: string;
  name: string;
  slug: string;
  modelYear: number;
  fuelType: string;
  transmissionType: string;
  drivetrain: string;
  seatingCapacity: number;
  doors: number;
  engine: Record<string, number | string>;
  priceAED: number;
  description: string;
  specs: {
    topSpeedKph: number;
    acceleration0To100Kph: number;
    lengthMm: number;
    widthMm: number;
    heightMm: number;
    wheelbaseMm: number;
    bootSpaceLitres: number;
    fuelTankLitres: number;
    kerbWeightKg: number;
    airbags: number;
    fuelEconomyCombined: number;
    fuelEconomyCity: number;
    fuelEconomyHighway: number;
  };
  colorSlugs: string[];
  featureSlugs: string[];
};

type ModelBundle = {
  brandSlug: string;
  brandName: string;
  brandCode: string;
  originCountryCode: string;
  modelName: string;
  modelSlug: string;
  bodyType: string;
  genName: string;
  genSlug: string;
  variants: VariantSpec[];
};

const LOST_BRANDS = [
  { brandCode: 'ALFA', name: 'Alfa Romeo', slug: 'alfa-romeo', originCountryCode: 'IT' },
  { brandCode: 'ABARTH', name: 'Abarth', slug: 'abarth', originCountryCode: 'IT' },
  { brandCode: 'GWM', name: 'Great Wall Motor', slug: 'great-wall-motor', originCountryCode: 'CN' },
  { brandCode: 'BESTUNE', name: 'Bestune', slug: 'bestune', originCountryCode: 'CN' },
  { brandCode: 'FORTHING', name: 'Forthing', slug: 'forthing', originCountryCode: 'CN' },
  { brandCode: 'GAC', name: 'GAC Motor', slug: 'gac-motor', originCountryCode: 'CN' },
  { brandCode: 'GMC', name: 'GMC', slug: 'gmc', originCountryCode: 'US' },
  { brandCode: 'INEOS', name: 'INEOS Grenadier', slug: 'ineos-grenadier', originCountryCode: 'GB' },
  { brandCode: 'HONGQI', name: 'Hongqi', slug: 'hongqi', originCountryCode: 'CN' },
  { brandCode: 'ISUZU', name: 'ISUZU', slug: 'isuzu', originCountryCode: 'JP' },
  { brandCode: 'JAC', name: 'JAC', slug: 'jac', originCountryCode: 'CN' },
  { brandCode: 'BUGATTI', name: 'BUGATTI', slug: 'bugatti', originCountryCode: 'FR' },
];

const COMMON_FEATURES = [
  'adaptive-cruise-control',
  'blind-spot-monitoring',
  'lane-keeping-assist',
  'apple-carplay',
  'android-auto',
  'panoramic-sunroof',
  'ventilated-front-seats',
  'heated-front-seats',
  '360-degree-camera',
  'digital-instrument-cluster',
  'matrix-led-headlights',
  'keyless-entry',
  'push-button-start',
  'parking-sensors',
  'wireless-charging',
  'ambient-lighting',
];

const COMMON_COLORS = [
  'pearl-white',
  'midnight-black',
  'titanium-silver',
  'graphite-grey',
  'firestorm-red',
  'glacier-blue',
];

/** Proven from pre-wipe live audits (prices/names/slugs/engine). */
const LOST_VEHICLES: ModelBundle[] = [
  {
    brandSlug: 'alfa-romeo',
    brandName: 'Alfa Romeo',
    brandCode: 'ALFA',
    originCountryCode: 'IT',
    modelName: 'Giulia',
    modelSlug: 'giulia',
    bodyType: 'Sedan',
    genName: '952 Generation',
    genSlug: 'giulia-952',
    variants: [
      {
        variantCode: 'ALFA-GIULIA-VELOCE-25',
        name: 'Veloce',
        slug: 'veloce',
        modelYear: 2025,
        fuelType: 'petrol',
        transmissionType: 'automatic',
        drivetrain: 'rwd',
        seatingCapacity: 5,
        doors: 4,
        engine: { displacementCc: 1995, cylinders: 4, powerHp: 280, torqueNm: 400, aspiration: 'Turbocharged' },
        priceAED: 239900,
        description: 'Alfa Romeo Giulia Veloce — Italian sports sedan character with sharp handling.',
        specs: {
          topSpeedKph: 240,
          acceleration0To100Kph: 5.7,
          lengthMm: 4643,
          widthMm: 1860,
          heightMm: 1438,
          wheelbaseMm: 2820,
          bootSpaceLitres: 480,
          fuelTankLitres: 58,
          kerbWeightKg: 1520,
          airbags: 6,
          fuelEconomyCombined: 8.2,
          fuelEconomyCity: 9.8,
          fuelEconomyHighway: 7.1,
        },
        colorSlugs: COMMON_COLORS,
        featureSlugs: COMMON_FEATURES,
      },
      {
        variantCode: 'ALFA-GIULIA-QF-25',
        name: 'Quadrifoglio',
        slug: 'quadrifoglio',
        modelYear: 2025,
        fuelType: 'petrol',
        transmissionType: 'automatic',
        drivetrain: 'rwd',
        seatingCapacity: 5,
        doors: 4,
        engine: { displacementCc: 2891, cylinders: 6, powerHp: 510, torqueNm: 600, aspiration: 'twin-turbo' },
        priceAED: 440000,
        description: 'Alfa Romeo Giulia Quadrifoglio — flagship performance sedan.',
        specs: {
          topSpeedKph: 307,
          acceleration0To100Kph: 3.9,
          lengthMm: 4643,
          widthMm: 1860,
          heightMm: 1426,
          wheelbaseMm: 2820,
          bootSpaceLitres: 480,
          fuelTankLitres: 58,
          kerbWeightKg: 1620,
          airbags: 6,
          fuelEconomyCombined: 10.5,
          fuelEconomyCity: 13.0,
          fuelEconomyHighway: 8.8,
        },
        colorSlugs: COMMON_COLORS,
        featureSlugs: [...COMMON_FEATURES, 'sport-mode', 'launch-control', 'head-up-display'],
      },
      {
        variantCode: 'ALFA-GIULIA-QFSS-25',
        name: 'Quadrifoglio Super Sport',
        slug: 'quadrifoglio-super-sport',
        modelYear: 2025,
        fuelType: 'petrol',
        transmissionType: 'automatic',
        drivetrain: 'rwd',
        seatingCapacity: 5,
        doors: 4,
        engine: { displacementCc: 2891, cylinders: 6, powerHp: 520, torqueNm: 600, aspiration: 'twin-turbo' },
        priceAED: 539900,
        description: 'Alfa Romeo Giulia Quadrifoglio Super Sport — top Giulia performance trim.',
        specs: {
          topSpeedKph: 310,
          acceleration0To100Kph: 3.8,
          lengthMm: 4643,
          widthMm: 1860,
          heightMm: 1426,
          wheelbaseMm: 2820,
          bootSpaceLitres: 480,
          fuelTankLitres: 58,
          kerbWeightKg: 1610,
          airbags: 6,
          fuelEconomyCombined: 10.8,
          fuelEconomyCity: 13.4,
          fuelEconomyHighway: 9.0,
        },
        colorSlugs: COMMON_COLORS,
        featureSlugs: [...COMMON_FEATURES, 'sport-mode', 'launch-control', 'head-up-display'],
      },
    ],
  },
  {
    brandSlug: 'alfa-romeo',
    brandName: 'Alfa Romeo',
    brandCode: 'ALFA',
    originCountryCode: 'IT',
    modelName: 'Stelvio',
    modelSlug: 'stelvio',
    bodyType: 'SUV',
    genName: '949 Generation',
    genSlug: 'stelvio-949',
    variants: [
      {
        variantCode: 'ALFA-STELVIO-VELOCE-1-25',
        name: 'Veloce-1',
        slug: 'veloce-1',
        modelYear: 2025,
        fuelType: 'petrol',
        transmissionType: 'automatic',
        drivetrain: 'awd',
        seatingCapacity: 5,
        doors: 5,
        engine: { displacementCc: 1995, cylinders: 4, powerHp: 280, torqueNm: 400, aspiration: 'Turbocharged' },
        priceAED: 239900,
        description: 'Alfa Romeo Stelvio Veloce — performance-leaning Italian SUV.',
        specs: {
          topSpeedKph: 230,
          acceleration0To100Kph: 5.7,
          lengthMm: 4687,
          widthMm: 1903,
          heightMm: 1671,
          wheelbaseMm: 2818,
          bootSpaceLitres: 525,
          fuelTankLitres: 64,
          kerbWeightKg: 1830,
          airbags: 6,
          fuelEconomyCombined: 8.9,
          fuelEconomyCity: 10.6,
          fuelEconomyHighway: 7.8,
        },
        colorSlugs: COMMON_COLORS,
        featureSlugs: COMMON_FEATURES,
      },
    ],
  },
  {
    brandSlug: 'audi',
    brandName: 'Audi',
    brandCode: 'AUDI',
    originCountryCode: 'DE',
    modelName: 'Audi A5',
    modelSlug: 'audi-a5',
    bodyType: 'Coupe',
    genName: 'B9 Generation',
    genSlug: 'a5-b9',
    variants: [
      {
        variantCode: 'AUDI-A5-20TFSI-08',
        name: 'A5 2.0 TFSI',
        slug: 'a5-20-tfsi',
        modelYear: 2008,
        fuelType: 'petrol',
        transmissionType: 'cvt',
        drivetrain: 'fwd',
        seatingCapacity: 5,
        doors: 5,
        engine: { displacementCc: 1984, cylinders: 4, powerHp: 190, torqueNm: 320, aspiration: 'turbo' },
        priceAED: 229900,
        description: 'Audi A5 2.0 TFSI — restored from pre-wipe catalog listing.',
        specs: {
          topSpeedKph: 210,
          acceleration0To100Kph: 7.5,
          lengthMm: 4700,
          widthMm: 1840,
          heightMm: 1370,
          wheelbaseMm: 2760,
          bootSpaceLitres: 450,
          fuelTankLitres: 58,
          kerbWeightKg: 1550,
          airbags: 6,
          fuelEconomyCombined: 7.5,
          fuelEconomyCity: 9.0,
          fuelEconomyHighway: 6.5,
        },
        colorSlugs: COMMON_COLORS,
        featureSlugs: [
          'apple-carplay',
          'android-auto',
          'led-headlights',
          'keyless-entry',
          'parking-sensors',
          'dual-zone-climate-control',
        ],
      },
    ],
  },
  {
    brandSlug: 'mercedes-benz',
    brandName: 'Mercedes-Benz',
    brandCode: 'MERCEDES',
    originCountryCode: 'DE',
    modelName: 'C-Class',
    modelSlug: 'c-class',
    bodyType: 'Sedan',
    genName: 'W206 Generation',
    genSlug: 'c-class-w206',
    variants: [
      {
        variantCode: 'MB-C200-ALT-25',
        name: 'Mercedes Benz C200',
        slug: 'mercedes-benz-c200',
        modelYear: 2026,
        fuelType: 'petrol',
        transmissionType: 'automatic',
        drivetrain: 'rwd',
        seatingCapacity: 5,
        doors: 5,
        engine: { displacementCc: 1496, cylinders: 4, powerHp: 204, torqueNm: 300, aspiration: 'turbo' },
        priceAED: 261900,
        description: 'Mercedes-Benz C200 — restored alternate C-Class listing from pre-wipe catalog.',
        specs: {
          topSpeedKph: 240,
          acceleration0To100Kph: 7.3,
          lengthMm: 4751,
          widthMm: 1820,
          heightMm: 1438,
          wheelbaseMm: 2865,
          bootSpaceLitres: 455,
          fuelTankLitres: 66,
          kerbWeightKg: 1560,
          airbags: 8,
          fuelEconomyCombined: 6.8,
          fuelEconomyCity: 8.2,
          fuelEconomyHighway: 5.9,
        },
        colorSlugs: COMMON_COLORS,
        featureSlugs: COMMON_FEATURES,
      },
    ],
  },
];

async function ensureBrand(
  db: mongoose.mongo.Db,
  b: { brandCode: string; name: string; slug: string; originCountryCode: string },
): Promise<{ id: Types.ObjectId; created: boolean }> {
  const existing = await db.collection('brands').findOne({ slug: b.slug });
  if (existing) return { id: existing._id as Types.ObjectId, created: false };
  const now = new Date();
  const res = await db.collection('brands').insertOne({
    ...b,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
  return { id: res.insertedId, created: true };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI required');
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  console.log('Restoring lost originals into', db.databaseName, '(ADD ONLY)\n');

  const before = {
    brands: await db.collection('brands').countDocuments(),
    models: await db.collection('models').countDocuments(),
    variants: await db.collection('variants').countDocuments(),
  };
  console.log('Before', before);

  let market = await db.collection('markets').findOne({ code: 'UAE' });
  if (!market) throw new Error('UAE market missing');

  const colorBySlug = new Map(
    (await db.collection('colors').find({}).project({ slug: 1 }).toArray()).map((c) => [c.slug, c._id]),
  );
  const featureBySlug = new Map(
    (await db.collection('features').find({}).project({ slug: 1 }).toArray()).map((f) => [f.slug, f._id]),
  );

  const stats = {
    brandsAdded: 0,
    modelsAdded: 0,
    gensAdded: 0,
    variantsAdded: 0,
    skippedVariants: 0,
  };

  for (const b of LOST_BRANDS) {
    const { created } = await ensureBrand(db, b);
    if (created) {
      stats.brandsAdded += 1;
      console.log('+ brand', b.slug);
    }
  }

  for (const item of LOST_VEHICLES) {
    const { id: brandId } = await ensureBrand(db, {
      brandCode: item.brandCode,
      name: item.brandName,
      slug: item.brandSlug,
      originCountryCode: item.originCountryCode,
    });

    let model = await db.collection('models').findOne({ slug: item.modelSlug });
    if (!model) {
      const modelCode = `${item.brandCode}-${item.modelSlug}`
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '')
        .slice(0, 24);
      try {
        const ins = await db.collection('models').insertOne({
          brandId,
          modelCode,
          name: item.modelName,
          slug: item.modelSlug,
          bodyType: item.bodyType,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        model = await db.collection('models').findOne({ _id: ins.insertedId });
        stats.modelsAdded += 1;
        console.log('+ model', item.modelSlug);
      } catch (e: any) {
        console.warn('! model failed', item.modelSlug, e.message);
        continue;
      }
    }

    let generation = await db.collection('generations').findOne({ slug: item.genSlug });
    if (!generation) {
      try {
        const ins = await db.collection('generations').insertOne({
          modelId: model!._id,
          generationCode: item.genSlug.toUpperCase().replace(/-/g, '_').slice(0, 32),
          name: item.genName,
          slug: item.genSlug,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        generation = await db.collection('generations').findOne({ _id: ins.insertedId });
        stats.gensAdded += 1;
        console.log('+ generation', item.genSlug);
      } catch (e: any) {
        console.warn('! generation failed', item.genSlug, e.message);
        continue;
      }
    }

    for (const v of item.variants) {
      if (await db.collection('variants').findOne({ slug: v.slug })) {
        stats.skippedVariants += 1;
        console.log('skip exists', v.slug);
        continue;
      }
      const now = new Date();
      try {
        const ins = await db.collection('variants').insertOne({
          modelId: model!._id,
          generationId: generation!._id,
          variantCode: v.variantCode,
          name: v.name,
          slug: v.slug,
          description: v.description,
          shortDescription: v.description.slice(0, 120),
          modelYear: v.modelYear,
          fuelType: v.fuelType,
          transmissionType: v.transmissionType,
          drivetrain: v.drivetrain,
          seatingCapacity: v.seatingCapacity,
          doors: v.doors,
          engine: v.engine,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
        const variantId = ins.insertedId;
        stats.variantsAdded += 1;
        console.log('+ variant', v.slug, v.priceAED);

        await db.collection('specifications').insertOne({
          variantId,
          performance: {
            topSpeedKph: v.specs.topSpeedKph,
            acceleration0To100Kph: v.specs.acceleration0To100Kph,
          },
          dimensions: {
            lengthMm: v.specs.lengthMm,
            widthMm: v.specs.widthMm,
            heightMm: v.specs.heightMm,
            wheelbaseMm: v.specs.wheelbaseMm,
          },
          capacity: {
            bootSpaceLitres: v.specs.bootSpaceLitres,
            fuelTankLitres: v.specs.fuelTankLitres,
          },
          weight: { kerbWeightKg: v.specs.kerbWeightKg },
          fuel: {
            fuelEconomyCombined: v.specs.fuelEconomyCombined,
            fuelEconomyCity: v.specs.fuelEconomyCity,
            fuelEconomyHighway: v.specs.fuelEconomyHighway,
            economyUnit: 'L/100km',
          },
          safety: {
            airbags: v.specs.airbags,
            abs: true,
            tractionControl: true,
            stabilityControl: true,
          },
          createdAt: now,
          updatedAt: now,
        });

        await db.collection('variantmarkets').insertOne({
          variantId,
          marketId: market._id,
          availabilityStatus: 'available',
          pricing: { amount: v.priceAED, currencyCode: 'AED', priceType: 'starting' },
          isFeatured: false,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });

        for (const cSlug of v.colorSlugs) {
          const colorId = colorBySlug.get(cSlug);
          if (!colorId) continue;
          if (await db.collection('variantcolors').findOne({ variantId, colorId })) continue;
          await db.collection('variantcolors').insertOne({
            variantId,
            colorId,
            availability: 'standard',
            status: 'active',
            createdAt: now,
            updatedAt: now,
          });
        }

        for (const fSlug of v.featureSlugs) {
          const featureId = featureBySlug.get(fSlug);
          if (!featureId) continue;
          if (await db.collection('variantfeatures').findOne({ variantId, featureId })) continue;
          await db.collection('variantfeatures').insertOne({
            variantId,
            featureId,
            availability: 'standard',
            value: '',
            status: 'active',
            createdAt: now,
            updatedAt: now,
          });
        }
      } catch (e: any) {
        console.warn('! variant failed', v.slug, e.message);
      }
    }
  }

  const after = {
    brands: await db.collection('brands').countDocuments(),
    models: await db.collection('models').countDocuments(),
    variants: await db.collection('variants').countDocuments(),
  };
  console.log('\nStats', stats);
  console.log('After', after);
  console.log('Delta', {
    brands: after.brands - before.brands,
    models: after.models - before.models,
    variants: after.variants - before.variants,
  });

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
