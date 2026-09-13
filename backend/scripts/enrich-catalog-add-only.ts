/**
 * ADD-ONLY catalog enrichment for rideroundup.
 * - Never deleteMany / drop / overwrite existing docs
 * - Skip any brand/model/generation/variant whose slug already exists
 * - Reuse existing market, colors, features when present
 *
 * Run: npx tsx scripts/enrich-catalog-add-only.ts
 */
import 'dotenv/config';
import mongoose, { Types } from 'mongoose';

type NewVehicle = {
  brandSlug: string;
  brandName: string;
  brandCode: string;
  originCountryCode: string;
  modelName: string;
  modelSlug: string;
  bodyType: string;
  genName: string;
  genSlug: string;
  variant: {
    variantCode: string;
    name: string;
    slug: string;
    modelYear: number;
    fuelType: string;
    transmissionType: string;
    drivetrain: string;
    seatingCapacity: number;
    doors: number;
    engine: {
      displacementCc?: number;
      cylinders?: number;
      powerHp: number;
      torqueNm: number;
      aspiration?: string;
    };
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
    featureSlugs: string[];
    colorSlugs: string[];
  };
};

const TO_ADD: NewVehicle[] = [
  {
    brandSlug: 'honda',
    brandName: 'Honda',
    brandCode: 'HONDA',
    originCountryCode: 'JP',
    modelName: 'CR-V',
    modelSlug: 'cr-v',
    bodyType: 'SUV',
    genName: '6th Generation',
    genSlug: 'cr-v-6th',
    variant: {
      variantCode: 'HONDA-CRV-EX-25',
      name: 'EX 1.5L Turbo',
      slug: 'honda-cr-v-ex-15t-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'cvt',
      drivetrain: 'awd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 1498, cylinders: 4, powerHp: 190, torqueNm: 240, aspiration: 'turbo' },
      priceAED: 135000,
      description: 'Family-friendly Honda CR-V with turbo efficiency and AWD confidence for UAE roads.',
      specs: {
        topSpeedKph: 200,
        acceleration0To100Kph: 8.5,
        lengthMm: 4706,
        widthMm: 1866,
        heightMm: 1681,
        wheelbaseMm: 2700,
        bootSpaceLitres: 589,
        fuelTankLitres: 57,
        kerbWeightKg: 1680,
        airbags: 8,
        fuelEconomyCombined: 7.2,
        fuelEconomyCity: 8.4,
        fuelEconomyHighway: 6.5,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'lane-keeping-assist',
        'apple-carplay',
        'android-auto',
        'keyless-entry',
        'push-button-start',
        'parking-sensors',
        'led-headlights',
        'dual-zone-climate-control',
        'blind-spot-monitoring',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'glacier-blue'],
    },
  },
  {
    brandSlug: 'honda',
    brandName: 'Honda',
    brandCode: 'HONDA',
    originCountryCode: 'JP',
    modelName: 'Civic',
    modelSlug: 'civic',
    bodyType: 'Sedan',
    genName: '11th Generation',
    genSlug: 'civic-11th',
    variant: {
      variantCode: 'HONDA-CIVIC-RS-25',
      name: 'RS 1.5L Turbo',
      slug: 'honda-civic-rs-15t-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'cvt',
      drivetrain: 'fwd',
      seatingCapacity: 5,
      doors: 4,
      engine: { displacementCc: 1498, cylinders: 4, powerHp: 180, torqueNm: 240, aspiration: 'turbo' },
      priceAED: 105000,
      description: 'Sharp Honda Civic RS sedan — sporty daily driver with strong efficiency.',
      specs: {
        topSpeedKph: 210,
        acceleration0To100Kph: 7.8,
        lengthMm: 4678,
        widthMm: 1802,
        heightMm: 1415,
        wheelbaseMm: 2735,
        bootSpaceLitres: 409,
        fuelTankLitres: 47,
        kerbWeightKg: 1370,
        airbags: 8,
        fuelEconomyCombined: 6.4,
        fuelEconomyCity: 7.5,
        fuelEconomyHighway: 5.8,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'lane-keeping-assist',
        'apple-carplay',
        'android-auto',
        'sport-mode',
        'led-headlights',
        'keyless-entry',
        'push-button-start',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'firestorm-red', 'titanium-silver'],
    },
  },
  {
    brandSlug: 'chevrolet',
    brandName: 'Chevrolet',
    brandCode: 'CHEVROLET',
    originCountryCode: 'US',
    modelName: 'Tahoe',
    modelSlug: 'tahoe',
    bodyType: 'SUV',
    genName: '5th Generation',
    genSlug: 'tahoe-5th',
    variant: {
      variantCode: 'CHEVY-TAHOE-LT-25',
      name: 'LT 5.3L V8',
      slug: 'chevrolet-tahoe-lt-53-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'automatic',
      drivetrain: '4wd',
      seatingCapacity: 8,
      doors: 5,
      engine: { displacementCc: 5300, cylinders: 8, powerHp: 355, torqueNm: 518 },
      priceAED: 285000,
      description: 'Full-size Chevrolet Tahoe LT — space, towing confidence, and V8 presence.',
      specs: {
        topSpeedKph: 180,
        acceleration0To100Kph: 7.5,
        lengthMm: 5356,
        widthMm: 2059,
        heightMm: 1925,
        wheelbaseMm: 3071,
        bootSpaceLitres: 722,
        fuelTankLitres: 91,
        kerbWeightKg: 2550,
        airbags: 8,
        fuelEconomyCombined: 13.5,
        fuelEconomyCity: 15.8,
        fuelEconomyHighway: 11.5,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'blind-spot-monitoring',
        'apple-carplay',
        'android-auto',
        'tri-zone-climate-control',
        '360-degree-camera',
        'power-tailgate',
        'keyless-entry',
        'push-button-start',
        'parking-sensors',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey'],
    },
  },
  {
    brandSlug: 'volkswagen',
    brandName: 'Volkswagen',
    brandCode: 'VW',
    originCountryCode: 'DE',
    modelName: 'Tiguan',
    modelSlug: 'tiguan',
    bodyType: 'SUV',
    genName: '3rd Generation',
    genSlug: 'tiguan-3rd',
    variant: {
      variantCode: 'VW-TIGUAN-RLINE-25',
      name: 'R-Line 2.0 TSI',
      slug: 'volkswagen-tiguan-r-line-20tsi-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'dct',
      drivetrain: 'awd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 1984, cylinders: 4, powerHp: 204, torqueNm: 320, aspiration: 'turbo' },
      priceAED: 168000,
      description: 'Volkswagen Tiguan R-Line — refined Euro SUV with AWD and strong daily manners.',
      specs: {
        topSpeedKph: 220,
        acceleration0To100Kph: 7.1,
        lengthMm: 4540,
        widthMm: 1859,
        heightMm: 1675,
        wheelbaseMm: 2680,
        bootSpaceLitres: 615,
        fuelTankLitres: 60,
        kerbWeightKg: 1650,
        airbags: 7,
        fuelEconomyCombined: 7.8,
        fuelEconomyCity: 9.2,
        fuelEconomyHighway: 6.8,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'lane-keeping-assist',
        'digital-instrument-cluster',
        'apple-carplay',
        'android-auto',
        'panoramic-sunroof',
        'led-headlights',
        'parking-sensors',
        'keyless-entry',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'glacier-blue', 'graphite-grey'],
    },
  },
  {
    brandSlug: 'mazda',
    brandName: 'Mazda',
    brandCode: 'MAZDA',
    originCountryCode: 'JP',
    modelName: 'CX-5',
    modelSlug: 'cx-5',
    bodyType: 'SUV',
    genName: 'KF Generation',
    genSlug: 'cx-5-kf',
    variant: {
      variantCode: 'MAZDA-CX5-GT-25',
      name: 'GT 2.5L',
      slug: 'mazda-cx-5-gt-25-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'automatic',
      drivetrain: 'awd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 2488, cylinders: 4, powerHp: 194, torqueNm: 258 },
      priceAED: 125000,
      description: 'Mazda CX-5 GT — premium compact SUV feel with engaging drive.',
      specs: {
        topSpeedKph: 200,
        acceleration0To100Kph: 8.9,
        lengthMm: 4575,
        widthMm: 1845,
        heightMm: 1680,
        wheelbaseMm: 2700,
        bootSpaceLitres: 506,
        fuelTankLitres: 58,
        kerbWeightKg: 1620,
        airbags: 6,
        fuelEconomyCombined: 8.1,
        fuelEconomyCity: 9.5,
        fuelEconomyHighway: 7.2,
      },
      featureSlugs: [
        'blind-spot-monitoring',
        'apple-carplay',
        'android-auto',
        'led-headlights',
        'keyless-entry',
        'push-button-start',
        'heated-front-seats',
        'parking-sensors',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'firestorm-red', 'titanium-silver'],
    },
  },
  {
    brandSlug: 'jeep',
    brandName: 'Jeep',
    brandCode: 'JEEP',
    originCountryCode: 'US',
    modelName: 'Wrangler',
    modelSlug: 'wrangler',
    bodyType: 'SUV',
    genName: 'JL Generation',
    genSlug: 'wrangler-jl',
    variant: {
      variantCode: 'JEEP-WRANGLER-SAHARA-25',
      name: 'Sahara 2.0L Turbo',
      slug: 'jeep-wrangler-sahara-20t-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'automatic',
      drivetrain: '4wd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 1995, cylinders: 4, powerHp: 268, torqueNm: 400, aspiration: 'turbo' },
      priceAED: 245000,
      description: 'Iconic Jeep Wrangler Sahara — open-air adventure ready for desert weekends.',
      specs: {
        topSpeedKph: 180,
        acceleration0To100Kph: 7.6,
        lengthMm: 4882,
        widthMm: 1894,
        heightMm: 1868,
        wheelbaseMm: 3008,
        bootSpaceLitres: 897,
        fuelTankLitres: 81,
        kerbWeightKg: 2050,
        airbags: 6,
        fuelEconomyCombined: 11.2,
        fuelEconomyCity: 13.0,
        fuelEconomyHighway: 9.8,
      },
      featureSlugs: [
        'terrain-management',
        'apple-carplay',
        'android-auto',
        'led-headlights',
        'keyless-entry',
        'parking-sensors',
        'sport-mode',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'firestorm-red', 'forest-green'],
    },
  },
  {
    brandSlug: 'volvo',
    brandName: 'Volvo',
    brandCode: 'VOLVO',
    originCountryCode: 'SE',
    modelName: 'XC60',
    modelSlug: 'xc60',
    bodyType: 'SUV',
    genName: '2nd Generation',
    genSlug: 'xc60-2nd',
    variant: {
      variantCode: 'VOLVO-XC60-B5-25',
      name: 'B5 Ultimate Bright',
      slug: 'volvo-xc60-b5-ultimate-2025',
      modelYear: 2025,
      fuelType: 'hybrid',
      transmissionType: 'automatic',
      drivetrain: 'awd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 1969, cylinders: 4, powerHp: 250, torqueNm: 350, aspiration: 'turbo' },
      priceAED: 265000,
      description: 'Volvo XC60 B5 — safety-first luxury SUV with mild-hybrid efficiency.',
      specs: {
        topSpeedKph: 180,
        acceleration0To100Kph: 6.9,
        lengthMm: 4708,
        widthMm: 1902,
        heightMm: 1658,
        wheelbaseMm: 2865,
        bootSpaceLitres: 483,
        fuelTankLitres: 71,
        kerbWeightKg: 1880,
        airbags: 8,
        fuelEconomyCombined: 7.4,
        fuelEconomyCity: 8.6,
        fuelEconomyHighway: 6.6,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'blind-spot-monitoring',
        'lane-keeping-assist',
        'panoramic-sunroof',
        'apple-carplay',
        'android-auto',
        'head-up-display',
        'ventilated-front-seats',
        'matrix-led-headlights',
        '360-degree-camera',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'navy-blue'],
    },
  },
  {
    brandSlug: 'mitsubishi',
    brandName: 'Mitsubishi',
    brandCode: 'MITSUBISHI',
    originCountryCode: 'JP',
    modelName: 'Pajero',
    modelSlug: 'pajero',
    bodyType: 'SUV',
    genName: 'Sport Generation',
    genSlug: 'pajero-sport',
    variant: {
      variantCode: 'MITSU-PAJERO-MONTERO-25',
      name: 'Montero Sport 2.4L Diesel',
      slug: 'mitsubishi-pajero-sport-24d-2025',
      modelYear: 2025,
      fuelType: 'diesel',
      transmissionType: 'automatic',
      drivetrain: '4wd',
      seatingCapacity: 7,
      doors: 5,
      engine: { displacementCc: 2442, cylinders: 4, powerHp: 181, torqueNm: 430, aspiration: 'turbo' },
      priceAED: 145000,
      description: 'Mitsubishi Pajero Sport — tough 7-seater diesel for family and desert use.',
      specs: {
        topSpeedKph: 180,
        acceleration0To100Kph: 10.2,
        lengthMm: 4825,
        widthMm: 1815,
        heightMm: 1835,
        wheelbaseMm: 2800,
        bootSpaceLitres: 131,
        fuelTankLitres: 68,
        kerbWeightKg: 2100,
        airbags: 7,
        fuelEconomyCombined: 8.5,
        fuelEconomyCity: 10.0,
        fuelEconomyHighway: 7.5,
      },
      featureSlugs: [
        'terrain-management',
        'apple-carplay',
        'android-auto',
        'dual-zone-climate-control',
        'keyless-entry',
        'parking-sensors',
        'led-headlights',
        'roof-rails',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey'],
    },
  },
  {
    brandSlug: 'infiniti',
    brandName: 'Infiniti',
    brandCode: 'INFINITI',
    originCountryCode: 'JP',
    modelName: 'QX80',
    modelSlug: 'qx80',
    bodyType: 'SUV',
    genName: '2nd Generation',
    genSlug: 'qx80-2nd',
    variant: {
      variantCode: 'INF-QX80-AUTOGRAPH-25',
      name: 'Autograph 3.5L Twin Turbo',
      slug: 'infiniti-qx80-autograph-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'automatic',
      drivetrain: '4wd',
      seatingCapacity: 7,
      doors: 5,
      engine: { displacementCc: 3498, cylinders: 6, powerHp: 450, torqueNm: 700, aspiration: 'twin-turbo' },
      priceAED: 420000,
      description: 'Infiniti QX80 Autograph — flagship luxury full-size SUV presence.',
      specs: {
        topSpeedKph: 210,
        acceleration0To100Kph: 5.9,
        lengthMm: 5350,
        widthMm: 2100,
        heightMm: 1925,
        wheelbaseMm: 3075,
        bootSpaceLitres: 500,
        fuelTankLitres: 98,
        kerbWeightKg: 2750,
        airbags: 10,
        fuelEconomyCombined: 12.8,
        fuelEconomyCity: 15.0,
        fuelEconomyHighway: 11.0,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'blind-spot-monitoring',
        'massage-seats',
        'ventilated-front-seats',
        'panoramic-sunroof',
        '360-degree-camera',
        'head-up-display',
        'matrix-led-headlights',
        'power-tailgate',
        'tri-zone-climate-control',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'champagne-gold', 'graphite-grey'],
    },
  },
  {
    brandSlug: 'genesis',
    brandName: 'Genesis',
    brandCode: 'GENESIS',
    originCountryCode: 'KR',
    modelName: 'GV70',
    modelSlug: 'gv70',
    bodyType: 'SUV',
    genName: '1st Generation',
    genSlug: 'gv70-1st',
    variant: {
      variantCode: 'GEN-GV70-25T-25',
      name: '2.5T AWD Prestige',
      slug: 'genesis-gv70-25t-prestige-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'automatic',
      drivetrain: 'awd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 2497, cylinders: 4, powerHp: 300, torqueNm: 422, aspiration: 'turbo' },
      priceAED: 255000,
      description: 'Genesis GV70 Prestige — quiet luxury crossover with strong equipment levels.',
      specs: {
        topSpeedKph: 240,
        acceleration0To100Kph: 6.1,
        lengthMm: 4715,
        widthMm: 1910,
        heightMm: 1630,
        wheelbaseMm: 2875,
        bootSpaceLitres: 542,
        fuelTankLitres: 67,
        kerbWeightKg: 1890,
        airbags: 8,
        fuelEconomyCombined: 9.1,
        fuelEconomyCity: 10.8,
        fuelEconomyHighway: 8.0,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'blind-spot-monitoring',
        'lane-keeping-assist',
        'panoramic-sunroof',
        'ventilated-front-seats',
        'apple-carplay',
        'android-auto',
        'head-up-display',
        '360-degree-camera',
        'ambient-lighting',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'navy-blue'],
    },
  },
  {
    brandSlug: 'mg',
    brandName: 'MG',
    brandCode: 'MG',
    originCountryCode: 'CN',
    modelName: 'HS',
    modelSlug: 'hs',
    bodyType: 'SUV',
    genName: '1st Generation',
    genSlug: 'hs-1st',
    variant: {
      variantCode: 'MG-HS-TROPHY-25',
      name: 'Trophy 1.5T',
      slug: 'mg-hs-trophy-15t-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'dct',
      drivetrain: 'fwd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 1490, cylinders: 4, powerHp: 162, torqueNm: 250, aspiration: 'turbo' },
      priceAED: 89000,
      description: 'MG HS Trophy — value-packed mid-size SUV with strong kit for the price.',
      specs: {
        topSpeedKph: 190,
        acceleration0To100Kph: 9.5,
        lengthMm: 4610,
        widthMm: 1875,
        heightMm: 1685,
        wheelbaseMm: 2720,
        bootSpaceLitres: 463,
        fuelTankLitres: 55,
        kerbWeightKg: 1550,
        airbags: 6,
        fuelEconomyCombined: 7.6,
        fuelEconomyCity: 9.0,
        fuelEconomyHighway: 6.7,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'apple-carplay',
        'android-auto',
        'panoramic-sunroof',
        'led-headlights',
        'keyless-entry',
        'parking-sensors',
        'dual-zone-climate-control',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'firestorm-red', 'titanium-silver'],
    },
  },
  {
    brandSlug: 'byd',
    brandName: 'BYD',
    brandCode: 'BYD',
    originCountryCode: 'CN',
    modelName: 'Atto 3',
    modelSlug: 'atto-3',
    bodyType: 'SUV',
    genName: '1st Generation',
    genSlug: 'atto-3-1st',
    variant: {
      variantCode: 'BYD-ATTO3-EXT-25',
      name: 'Extended Range',
      slug: 'byd-atto-3-extended-2025',
      modelYear: 2025,
      fuelType: 'electric',
      transmissionType: 'automatic',
      drivetrain: 'fwd',
      seatingCapacity: 5,
      doors: 5,
      engine: { powerHp: 201, torqueNm: 310 },
      priceAED: 129000,
      description: 'BYD Atto 3 Extended — practical electric SUV for UAE city commuting.',
      specs: {
        topSpeedKph: 160,
        acceleration0To100Kph: 7.3,
        lengthMm: 4455,
        widthMm: 1875,
        heightMm: 1615,
        wheelbaseMm: 2720,
        bootSpaceLitres: 440,
        fuelTankLitres: 0,
        kerbWeightKg: 1750,
        airbags: 7,
        fuelEconomyCombined: 0,
        fuelEconomyCity: 0,
        fuelEconomyHighway: 0,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'lane-keeping-assist',
        'apple-carplay',
        'android-auto',
        'panoramic-sunroof',
        '360-degree-camera',
        'keyless-entry',
        'parking-sensors',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'glacier-blue', 'graphite-grey'],
    },
  },
  {
    brandSlug: 'haval',
    brandName: 'Haval',
    brandCode: 'HAVAL',
    originCountryCode: 'CN',
    modelName: 'H6',
    modelSlug: 'h6',
    bodyType: 'SUV',
    genName: '3rd Generation',
    genSlug: 'h6-3rd',
    variant: {
      variantCode: 'HAVAL-H6-GT-25',
      name: 'GT 2.0T',
      slug: 'haval-h6-gt-20t-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'dct',
      drivetrain: 'awd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 1998, cylinders: 4, powerHp: 204, torqueNm: 320, aspiration: 'turbo' },
      priceAED: 98000,
      description: 'Haval H6 GT — stylish crossover with turbo punch and AWD option.',
      specs: {
        topSpeedKph: 195,
        acceleration0To100Kph: 8.2,
        lengthMm: 4653,
        widthMm: 1886,
        heightMm: 1730,
        wheelbaseMm: 2738,
        bootSpaceLitres: 560,
        fuelTankLitres: 61,
        kerbWeightKg: 1700,
        airbags: 6,
        fuelEconomyCombined: 8.3,
        fuelEconomyCity: 9.8,
        fuelEconomyHighway: 7.3,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'apple-carplay',
        'android-auto',
        'panoramic-sunroof',
        'led-headlights',
        'keyless-entry',
        'parking-sensors',
        'dual-zone-climate-control',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'firestorm-red', 'titanium-silver'],
    },
  },
  {
    brandSlug: 'subaru',
    brandName: 'Subaru',
    brandCode: 'SUBARU',
    originCountryCode: 'JP',
    modelName: 'Forester',
    modelSlug: 'forester',
    bodyType: 'SUV',
    genName: '5th Generation',
    genSlug: 'forester-5th',
    variant: {
      variantCode: 'SUBARU-FORESTER-TOURING-25',
      name: 'Touring 2.5L AWD',
      slug: 'subaru-forester-touring-25-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'cvt',
      drivetrain: 'awd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 2498, cylinders: 4, powerHp: 182, torqueNm: 239 },
      priceAED: 132000,
      description: 'Subaru Forester Touring — Symmetrical AWD confidence for mixed UAE conditions.',
      specs: {
        topSpeedKph: 195,
        acceleration0To100Kph: 9.4,
        lengthMm: 4655,
        widthMm: 1815,
        heightMm: 1730,
        wheelbaseMm: 2670,
        bootSpaceLitres: 509,
        fuelTankLitres: 63,
        kerbWeightKg: 1620,
        airbags: 8,
        fuelEconomyCombined: 8.0,
        fuelEconomyCity: 9.4,
        fuelEconomyHighway: 7.1,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'lane-keeping-assist',
        'blind-spot-monitoring',
        'apple-carplay',
        'android-auto',
        'led-headlights',
        'keyless-entry',
        'parking-sensors',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'forest-green', 'titanium-silver'],
    },
  },
  {
    brandSlug: 'jaguar',
    brandName: 'Jaguar',
    brandCode: 'JAGUAR',
    originCountryCode: 'GB',
    modelName: 'F-Pace',
    modelSlug: 'f-pace',
    bodyType: 'SUV',
    genName: '1st Generation LCI',
    genSlug: 'f-pace-lci',
    variant: {
      variantCode: 'JAG-FPACE-RDIAMOND-25',
      name: 'R-Dynamic SE P250',
      slug: 'jaguar-f-pace-r-dynamic-se-2025',
      modelYear: 2025,
      fuelType: 'petrol',
      transmissionType: 'automatic',
      drivetrain: 'awd',
      seatingCapacity: 5,
      doors: 5,
      engine: { displacementCc: 1997, cylinders: 4, powerHp: 247, torqueNm: 365, aspiration: 'turbo' },
      priceAED: 295000,
      description: 'Jaguar F-Pace R-Dynamic SE — athletic luxury SUV character.',
      specs: {
        topSpeedKph: 217,
        acceleration0To100Kph: 7.0,
        lengthMm: 4747,
        widthMm: 2071,
        heightMm: 1664,
        wheelbaseMm: 2874,
        bootSpaceLitres: 613,
        fuelTankLitres: 82,
        kerbWeightKg: 1890,
        airbags: 6,
        fuelEconomyCombined: 9.0,
        fuelEconomyCity: 10.8,
        fuelEconomyHighway: 7.9,
      },
      featureSlugs: [
        'adaptive-cruise-control',
        'blind-spot-monitoring',
        'panoramic-sunroof',
        'apple-carplay',
        'android-auto',
        'ventilated-front-seats',
        'matrix-led-headlights',
        '360-degree-camera',
        'sport-mode',
      ],
      colorSlugs: ['pearl-white', 'midnight-black', 'navy-blue', 'firestorm-red'],
    },
  },
];

async function ensureBrand(
  db: mongoose.mongo.Db,
  item: NewVehicle,
): Promise<Types.ObjectId> {
  const existing = await db.collection('brands').findOne({ slug: item.brandSlug });
  if (existing) return existing._id as Types.ObjectId;

  const now = new Date();
  const doc = {
    brandCode: item.brandCode,
    name: item.brandName,
    slug: item.brandSlug,
    originCountryCode: item.originCountryCode,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const res = await db.collection('brands').insertOne(doc);
  console.log(`  + brand ${item.brandSlug}`);
  return res.insertedId;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing');

  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  console.log('Connected to', db.databaseName);
  console.log('Mode: ADD ONLY (skip existing slugs)\n');

  const before = {
    brands: await db.collection('brands').countDocuments(),
    models: await db.collection('models').countDocuments(),
    generations: await db.collection('generations').countDocuments(),
    variants: await db.collection('variants').countDocuments(),
    variantmarkets: await db.collection('variantmarkets').countDocuments(),
    specifications: await db.collection('specifications').countDocuments(),
  };
  console.log('Before', before);

  let market = await db.collection('markets').findOne({ code: 'UAE' });
  if (!market) {
    const ins = await db.collection('markets').insertOne({
      code: 'UAE',
      name: 'United Arab Emirates',
      countryCode: 'AE',
      currencyCode: 'AED',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    market = await db.collection('markets').findOne({ _id: ins.insertedId });
    console.log('  + market UAE');
  }

  const colors = await db.collection('colors').find({}).project({ slug: 1 }).toArray();
  const colorBySlug = new Map(colors.map((c) => [c.slug, c._id]));
  const features = await db.collection('features').find({}).project({ slug: 1 }).toArray();
  const featureBySlug = new Map(features.map((f) => [f.slug, f._id]));

  const stats = {
    skippedVariants: 0,
    addedModels: 0,
    addedGenerations: 0,
    addedVariants: 0,
    addedMarkets: 0,
    addedSpecs: 0,
    addedColorsLinks: 0,
    addedFeatureLinks: 0,
    backfilledModelIds: 0,
  };

  // Soft repair only: fill missing modelId from generation (does not remove data)
  const broken = await db
    .collection('variants')
    .find({
      $or: [{ modelId: { $exists: false } }, { modelId: null }],
      generationId: { $exists: true, $ne: null },
    })
    .toArray();
  for (const v of broken) {
    const gen = await db.collection('generations').findOne({ _id: v.generationId });
    if (gen?.modelId) {
      await db.collection('variants').updateOne({ _id: v._id }, { $set: { modelId: gen.modelId } });
      stats.backfilledModelIds += 1;
    }
  }

  for (const item of TO_ADD) {
    const existingVariant = await db.collection('variants').findOne({ slug: item.variant.slug });
    if (existingVariant) {
      stats.skippedVariants += 1;
      console.log(`skip variant (exists): ${item.variant.slug}`);
      continue;
    }

    const brandId = await ensureBrand(db, item);
    const now = new Date();

    let model = await db.collection('models').findOne({ slug: item.modelSlug });
    if (!model) {
      const modelCode = `${item.brandCode}-${item.modelSlug}`
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '')
        .slice(0, 24);
      try {
        const modelRes = await db.collection('models').insertOne({
          brandId,
          modelCode,
          name: item.modelName,
          slug: item.modelSlug,
          bodyType: item.bodyType,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
        model = await db.collection('models').findOne({ _id: modelRes.insertedId });
        stats.addedModels += 1;
        console.log(`  + model ${item.modelSlug} (${modelCode})`);
      } catch (err: any) {
        console.warn(`  ! model insert failed for ${item.modelSlug}:`, err?.message || err);
        continue;
      }
    }

    let generation = await db.collection('generations').findOne({ slug: item.genSlug });
    if (!generation) {
      try {
        const genRes = await db.collection('generations').insertOne({
          modelId: model!._id,
          generationCode: item.genSlug.toUpperCase().replace(/-/g, '_').slice(0, 32),
          name: item.genName,
          slug: item.genSlug,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
        generation = await db.collection('generations').findOne({ _id: genRes.insertedId });
        stats.addedGenerations += 1;
        console.log(`  + generation ${item.genSlug}`);
      } catch (err: any) {
        console.warn(`  ! generation insert failed for ${item.genSlug}:`, err?.message || err);
        continue;
      }
    }

    const v = item.variant;
    try {
      const variantRes = await db.collection('variants').insertOne({
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
      const variantId = variantRes.insertedId;
      stats.addedVariants += 1;
      console.log(`  + variant ${v.slug}`);

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
      stats.addedSpecs += 1;

      await db.collection('variantmarkets').insertOne({
        variantId,
        marketId: market!._id,
        availabilityStatus: 'available',
        pricing: {
          amount: v.priceAED,
          currencyCode: 'AED',
          priceType: 'starting',
        },
        isFeatured: false,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
      stats.addedMarkets += 1;

      for (const cSlug of v.colorSlugs) {
        const colorId = colorBySlug.get(cSlug);
        if (!colorId) continue;
        const exists = await db.collection('variantcolors').findOne({ variantId, colorId });
        if (exists) continue;
        await db.collection('variantcolors').insertOne({
          variantId,
          colorId,
          availability: 'standard',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
        stats.addedColorsLinks += 1;
      }

      for (const fSlug of v.featureSlugs) {
        const featureId = featureBySlug.get(fSlug);
        if (!featureId) continue;
        const exists = await db.collection('variantfeatures').findOne({ variantId, featureId });
        if (exists) continue;
        await db.collection('variantfeatures').insertOne({
          variantId,
          featureId,
          availability: 'standard',
          value: '',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
        stats.addedFeatureLinks += 1;
      }
    } catch (err: any) {
      console.warn(`  ! variant insert failed for ${v.slug}:`, err?.message || err);
      continue;
    }
  }

  const after = {
    brands: await db.collection('brands').countDocuments(),
    models: await db.collection('models').countDocuments(),
    generations: await db.collection('generations').countDocuments(),
    variants: await db.collection('variants').countDocuments(),
    variantmarkets: await db.collection('variantmarkets').countDocuments(),
    specifications: await db.collection('specifications').countDocuments(),
  };

  console.log('\nStats', stats);
  console.log('After', after);
  console.log('Delta', {
    brands: after.brands - before.brands,
    models: after.models - before.models,
    generations: after.generations - before.generations,
    variants: after.variants - before.variants,
    variantmarkets: after.variantmarkets - before.variantmarkets,
    specifications: after.specifications - before.specifications,
  });

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
