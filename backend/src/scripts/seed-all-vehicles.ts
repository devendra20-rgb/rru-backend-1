import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

// Load main .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { Brand } from '../modules/catalog/brands/brand.model';
import { VehicleModel } from '../modules/catalog/models/model.model';
import { Generation } from '../modules/catalog/generations/generation.model';
import { Variant } from '../modules/catalog/variants/variant.model';
import { Specification } from '../modules/catalog/specifications/specification.model';
import { Market } from '../modules/catalog/markets/market.model';
import { VariantMarket } from '../modules/catalog/variant-markets/variant-market.model';
import { Media } from '../modules/media/media.model';
import { CostToOwn } from '../modules/catalog/cost-to-own/cost-to-own.model';
import { Color, VariantColor } from '../modules/catalog/colors/color.model';
import { Feature, VariantFeature } from '../modules/catalog/features/feature.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/rideroundup?retryWrites=true&w=majority';

async function seedAllVehicles() {
  console.log('Connecting to MongoDB database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to:', mongoose.connection.name);

  // Fetch Maps of Brands, Colors, Features, and Market
  const brands = await Brand.find({ status: 'active' });
  const brandMap: Record<string, any> = {};
  brands.forEach(b => { brandMap[b.slug] = b; });

  const colors = await Color.find({ status: 'active' });
  const colorMap: Record<string, any> = {};
  colors.forEach(c => { colorMap[c.slug] = c; });

  const features = await Feature.find({ status: 'active' });
  const featureMap: Record<string, any> = {};
  features.forEach(f => { featureMap[f.slug] = f; });

  let marketUAE = await Market.findOne({ code: 'UAE' });
  if (!marketUAE) {
    marketUAE = await Market.create({
      code: 'UAE',
      name: 'United Arab Emirates',
      countryCode: 'AE',
      currencyCode: 'AED',
      status: 'active',
    });
  }

  interface VehicleData {
    modelName: string;
    modelSlug: string;
    brandSlug: string;
    bodyType: string;
    genName: string;
    genSlug: string;
    variants: {
      variantCode: string;
      name: string;
      slug: string;
      modelYear: number;
      fuelType: string;
      transmissionType: string;
      drivetrain: string;
      seatingCapacity: number;
      doors: number;
      engine: { displacementCc: number; cylinders: number; powerHp: number; torqueNm: number; aspiration?: string };
      priceAED: number;
      availabilityStatus: 'available' | 'unavailable' | 'upcoming' | 'discontinued';
      imageUrl: string;
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
      description: string;
      costs: { depreciation: number; insurance: number; fuel: number; service: number };
    }[];
  }

  const allVehicles: VehicleData[] = [
    // 1. Toyota Land Cruiser
    {
      modelName: 'Land Cruiser',
      modelSlug: 'land-cruiser',
      brandSlug: 'toyota',
      bodyType: 'SUV',
      genName: '300 Series',
      genSlug: 'lc-300',
      variants: [
        {
          variantCode: 'LC-GXR-V6-25',
          name: 'GXR V6 Twin Turbo',
          slug: 'toyota-land-cruiser-gxr-v6-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: '4wd',
          seatingCapacity: 7,
          doors: 5,
          engine: { displacementCc: 3445, cylinders: 6, powerHp: 409, torqueNm: 650, aspiration: 'twin-turbo' },
          priceAED: 335000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1669215420024-7d7e5e20ede4?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 7.0, lengthMm: 4985, widthMm: 1980, heightMm: 1870, wheelbaseMm: 2850, bootSpaceLitres: 308, fuelTankLitres: 110, kerbWeightKg: 2500, airbags: 10, fuelEconomyCombined: 11.4, fuelEconomyCity: 13.2, fuelEconomyHighway: 9.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'desert-sand', 'graphite-grey'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'panoramic-sunroof', 'ventilated-front-seats', '360-degree-camera', 'terrain-management', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'digital-instrument-cluster', 'power-tailgate', 'roof-rails'],
          description: 'The Toyota Land Cruiser GXR V6 is the ultimate all-terrain luxury SUV, built to conquer desert dunes and highway cruising.',
          costs: { depreciation: 4800, insurance: 2200, fuel: 1850, service: 800 },
        },
        {
          variantCode: 'LC-VXR-V6-25',
          name: 'VXR V6 Flagship',
          slug: 'toyota-land-cruiser-vxr-v6-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: '4wd',
          seatingCapacity: 7,
          doors: 5,
          engine: { displacementCc: 3445, cylinders: 6, powerHp: 409, torqueNm: 650, aspiration: 'twin-turbo' },
          priceAED: 390000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1669215420024-7d7e5e20ede4?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 6.8, lengthMm: 4985, widthMm: 1980, heightMm: 1870, wheelbaseMm: 2850, bootSpaceLitres: 308, fuelTankLitres: 110, kerbWeightKg: 2550, airbags: 10, fuelEconomyCombined: 11.8, fuelEconomyCity: 13.8, fuelEconomyHighway: 10.2 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'champagne-gold'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'panoramic-sunroof', 'ventilated-front-seats', 'ventilated-rear-seats', '360-degree-camera', 'terrain-management', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'matrix-led-headlights', 'digital-instrument-cluster', 'power-tailgate', 'massage-seats', 'memory-seats', 'air-suspension'],
          description: 'The flagship Toyota Land Cruiser VXR Twin Turbo offers pinnacle comfort, luxury, and unmatched off-road capability.',
          costs: { depreciation: 5600, insurance: 2500, fuel: 1950, service: 900 },
        },
      ],
    },

    // 2. Toyota Camry
    {
      modelName: 'Camry',
      modelSlug: 'camry',
      brandSlug: 'toyota',
      bodyType: 'Sedan',
      genName: 'XV80 Generation',
      genSlug: 'camry-xv80',
      variants: [
        {
          variantCode: 'CAMRY-35-GRANDE-25',
          name: '3.5L Grande',
          slug: 'toyota-camry-grande-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'fwd',
          seatingCapacity: 5,
          doors: 4,
          engine: { displacementCc: 3456, cylinders: 6, powerHp: 298, torqueNm: 362 },
          priceAED: 145000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 220, acceleration0To100Kph: 6.3, lengthMm: 4885, widthMm: 1840, heightMm: 1445, wheelbaseMm: 2825, bootSpaceLitres: 493, fuelTankLitres: 60, kerbWeightKg: 1635, airbags: 8, fuelEconomyCombined: 9.2, fuelEconomyCity: 10.8, fuelEconomyHighway: 8.1 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'firestorm-red', 'glacier-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'ventilated-front-seats', 'heated-front-seats', 'panoramic-sunroof', 'apple-carplay', 'android-auto', 'wireless-charging', 'head-up-display', 'digital-instrument-cluster', 'keyless-entry', 'push-button-start', 'parking-sensors', '360-degree-camera', 'led-headlights'],
          description: 'The Toyota Camry Grande offers an exceptional blend of performance, legendary reliability, and executive sedan comfort.',
          costs: { depreciation: 2000, insurance: 1000, fuel: 1100, service: 500 },
        },
        {
          variantCode: 'CAMRY-HYB-27',
          name: '2.5L Hybrid XLE',
          slug: 'toyota-camry-hybrid-2027',
          modelYear: 2027,
          fuelType: 'hybrid',
          transmissionType: 'cvt',
          drivetrain: 'fwd',
          seatingCapacity: 5,
          doors: 4,
          engine: { displacementCc: 2487, cylinders: 4, powerHp: 218, torqueNm: 221 },
          priceAED: 125000,
          availabilityStatus: 'upcoming',
          imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 200, acceleration0To100Kph: 7.2, lengthMm: 4885, widthMm: 1840, heightMm: 1445, wheelbaseMm: 2825, bootSpaceLitres: 428, fuelTankLitres: 50, kerbWeightKg: 1670, airbags: 8, fuelEconomyCombined: 4.8, fuelEconomyCity: 4.5, fuelEconomyHighway: 5.2 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'glacier-blue', 'forest-green'],
          featureSlugs: ['adaptive-cruise-control', 'lane-keeping-assist', 'apple-carplay', 'android-auto', 'wireless-charging', 'digital-instrument-cluster', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights'],
          description: 'The upcoming 2027 Toyota Camry Hybrid XLE delivers superior fuel economy with refined comfort.',
          costs: { depreciation: 1700, insurance: 900, fuel: 580, service: 400 },
        },
      ],
    },

    // 3. Toyota Prado
    {
      modelName: 'Prado',
      modelSlug: 'prado',
      brandSlug: 'toyota',
      bodyType: 'SUV',
      genName: 'J250 Series',
      genSlug: 'prado-j250',
      variants: [
        {
          variantCode: 'PRADO-TXL-25',
          name: 'TXL 2.4L Turbo',
          slug: 'toyota-prado-txl-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: '4wd',
          seatingCapacity: 7,
          doors: 5,
          engine: { displacementCc: 2393, cylinders: 4, powerHp: 278, torqueNm: 430, aspiration: 'turbo' },
          priceAED: 220000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 200, acceleration0To100Kph: 7.6, lengthMm: 4920, widthMm: 1980, heightMm: 1895, wheelbaseMm: 2850, bootSpaceLitres: 193, fuelTankLitres: 87, kerbWeightKg: 2250, airbags: 9, fuelEconomyCombined: 9.8, fuelEconomyCity: 11.2, fuelEconomyHighway: 8.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'desert-sand', 'graphite-grey', 'forest-green'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'terrain-management', 'panoramic-sunroof', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', '360-degree-camera', 'led-headlights', 'power-tailgate', 'roof-rails', 'running-boards'],
          description: 'The new Toyota Prado features a modern turbocharged engine with legendary Toyota off-road capability.',
          costs: { depreciation: 3200, insurance: 1500, fuel: 1300, service: 700 },
        },
      ],
    },

    // 4. Nissan Patrol
    {
      modelName: 'Patrol',
      modelSlug: 'patrol',
      brandSlug: 'nissan',
      bodyType: 'SUV',
      genName: 'Y62 Series',
      genSlug: 'patrol-y62',
      variants: [
        {
          variantCode: 'PATROL-LE-PLAT-25',
          name: 'LE Platinum V8 5.6L',
          slug: 'nissan-patrol-le-platinum-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: '4wd',
          seatingCapacity: 8,
          doors: 5,
          engine: { displacementCc: 5552, cylinders: 8, powerHp: 405, torqueNm: 560 },
          priceAED: 340000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 6.9, lengthMm: 5170, widthMm: 1995, heightMm: 1940, wheelbaseMm: 3075, bootSpaceLitres: 322, fuelTankLitres: 140, kerbWeightKg: 2740, airbags: 9, fuelEconomyCombined: 14.5, fuelEconomyCity: 17.0, fuelEconomyHighway: 12.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'champagne-gold', 'deep-burgundy'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-departure-warning', 'tri-zone-climate-control', 'ventilated-front-seats', 'ventilated-rear-seats', 'heated-rear-seats', 'massage-seats', 'memory-seats', '360-degree-camera', 'panoramic-sunroof', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'matrix-led-headlights', 'digital-instrument-cluster', 'power-tailgate', 'roof-rails', 'running-boards', 'terrain-management'],
          description: 'The legendary Nissan Patrol LE Platinum V8 is an iconic luxury 4WD commanding absolute respect on UAE roads.',
          costs: { depreciation: 4900, insurance: 2200, fuel: 2400, service: 900 },
        },
        {
          variantCode: 'PATROL-S-V8-25',
          name: 'S V8 5.6L',
          slug: 'nissan-patrol-s-v8-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: '4wd',
          seatingCapacity: 8,
          doors: 5,
          engine: { displacementCc: 5552, cylinders: 8, powerHp: 405, torqueNm: 560 },
          priceAED: 248000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 7.1, lengthMm: 5170, widthMm: 1995, heightMm: 1940, wheelbaseMm: 3075, bootSpaceLitres: 322, fuelTankLitres: 140, kerbWeightKg: 2690, airbags: 7, fuelEconomyCombined: 14.8, fuelEconomyCity: 17.5, fuelEconomyHighway: 12.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'dual-zone-climate-control', 'ventilated-front-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'digital-instrument-cluster', 'power-tailgate', 'running-boards'],
          description: 'The Nissan Patrol S V8 delivers V8 muscle and solid SUV capability at an accessible entry price.',
          costs: { depreciation: 3500, insurance: 1700, fuel: 2500, service: 800 },
        },
      ],
    },

    // 5. Nissan X-Terra
    {
      modelName: 'X-Terra',
      modelSlug: 'x-terra',
      brandSlug: 'nissan',
      bodyType: 'SUV',
      genName: 'N60 Generation',
      genSlug: 'xterra-n60',
      variants: [
        {
          variantCode: 'XTERRA-PRO4X-25',
          name: 'PRO-4X 2.5L',
          slug: 'nissan-xterra-pro4x-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: '4wd',
          seatingCapacity: 7,
          doors: 5,
          engine: { displacementCc: 2488, cylinders: 4, powerHp: 182, torqueNm: 242 },
          priceAED: 128000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1614543393951-f2f2e90c5af8?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 185, acceleration0To100Kph: 10.5, lengthMm: 4697, widthMm: 1903, heightMm: 1736, wheelbaseMm: 2705, bootSpaceLitres: 348, fuelTankLitres: 80, kerbWeightKg: 1980, airbags: 6, fuelEconomyCombined: 10.5, fuelEconomyCity: 12.0, fuelEconomyHighway: 9.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'firestorm-red', 'graphite-grey'],
          featureSlugs: ['terrain-management', 'apple-carplay', 'android-auto', 'dual-zone-climate-control', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'power-tailgate', 'roof-rails', 'running-boards'],
          description: 'The Nissan X-Terra PRO-4X is a proper off-road SUV designed for UAE desert adventure.',
          costs: { depreciation: 1700, insurance: 900, fuel: 1350, service: 500 },
        },
      ],
    },

    // 6. BMW X5
    {
      modelName: 'X5',
      modelSlug: 'x5',
      brandSlug: 'bmw',
      bodyType: 'SUV',
      genName: 'G05 LCI',
      genSlug: 'x5-g05',
      variants: [
        {
          variantCode: 'X5-40I-MPKG-25',
          name: 'xDrive40i M Sport',
          slug: 'bmw-x5-xdrive40i-m-sport-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 2998, cylinders: 6, powerHp: 382, torqueNm: 520, aspiration: 'turbo' },
          priceAED: 398000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 250, acceleration0To100Kph: 5.4, lengthMm: 4922, widthMm: 2004, heightMm: 1745, wheelbaseMm: 2975, bootSpaceLitres: 650, fuelTankLitres: 83, kerbWeightKg: 2205, airbags: 10, fuelEconomyCombined: 9.6, fuelEconomyCity: 11.2, fuelEconomyHighway: 8.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'glacier-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'parking-sensors', 'power-tailgate', 'air-suspension', 'sport-mode'],
          description: 'The BMW X5 xDrive40i M Sport delivers sports-sedan dynamics in a versatile, luxury German SUV package.',
          costs: { depreciation: 5500, insurance: 2800, fuel: 1400, service: 1100 },
        },
      ],
    },

    // 7. BMW 5 Series
    {
      modelName: '5 Series',
      modelSlug: '5-series',
      brandSlug: 'bmw',
      bodyType: 'Sedan',
      genName: 'G60 Generation',
      genSlug: '5-series-g60',
      variants: [
        {
          variantCode: 'BMW-530I-MSPORT-25',
          name: '530i M Sport',
          slug: 'bmw-530i-m-sport-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'rwd',
          seatingCapacity: 5,
          doors: 4,
          engine: { displacementCc: 1998, cylinders: 4, powerHp: 245, torqueNm: 400, aspiration: 'turbo' },
          priceAED: 280000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 250, acceleration0To100Kph: 6.2, lengthMm: 4996, widthMm: 1900, heightMm: 1515, wheelbaseMm: 2995, bootSpaceLitres: 520, fuelTankLitres: 65, kerbWeightKg: 1745, airbags: 8, fuelEconomyCombined: 6.8, fuelEconomyCity: 8.0, fuelEconomyHighway: 5.9 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'navy-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'parking-sensors', 'sport-mode', 'ambient-lighting', 'navigation-system', 'premium-sound-system'],
          description: 'The BMW 530i M Sport blends executive sedan refinement with M performance-inspired design.',
          costs: { depreciation: 3900, insurance: 2000, fuel: 1000, service: 1000 },
        },
      ],
    },

    // 8. Mercedes-Benz C-Class
    {
      modelName: 'C-Class',
      modelSlug: 'c-class',
      brandSlug: 'mercedes-benz',
      bodyType: 'Sedan',
      genName: 'W206 Generation',
      genSlug: 'c-class-w206',
      variants: [
        {
          variantCode: 'C200-AMG-25',
          name: 'C200 AMG Line',
          slug: 'mercedes-c200-amg-line-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'rwd',
          seatingCapacity: 5,
          doors: 4,
          engine: { displacementCc: 1496, cylinders: 4, powerHp: 204, torqueNm: 300, aspiration: 'turbo' },
          priceAED: 229000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1605559424843-9073c6223bed?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 240, acceleration0To100Kph: 7.5, lengthMm: 4751, widthMm: 1820, heightMm: 1438, wheelbaseMm: 2865, bootSpaceLitres: 455, fuelTankLitres: 66, kerbWeightKg: 1555, airbags: 8, fuelEconomyCombined: 6.7, fuelEconomyCity: 8.1, fuelEconomyHighway: 5.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'firestorm-red', 'glacier-blue', 'graphite-grey'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'rear-cross-traffic-alert', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'parking-sensors', 'ambient-lighting', 'premium-sound-system', 'navigation-system', 'rain-sensing-wipers'],
          description: 'The Mercedes-Benz C200 AMG Line brings executive luxury and AMG-inspired sporty styling to the popular C-Class.',
          costs: { depreciation: 3200, insurance: 1600, fuel: 900, service: 900 },
        },
      ],
    },

    // 9. Mercedes-Benz GLE
    {
      modelName: 'GLE',
      modelSlug: 'gle',
      brandSlug: 'mercedes-benz',
      bodyType: 'SUV',
      genName: 'V167 Generation',
      genSlug: 'gle-v167',
      variants: [
        {
          variantCode: 'GLE450-AMG-25',
          name: 'GLE 450 AMG Line 4MATIC',
          slug: 'mercedes-gle450-amg-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 2999, cylinders: 6, powerHp: 367, torqueNm: 500, aspiration: 'twin-turbo' },
          priceAED: 399000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 250, acceleration0To100Kph: 5.7, lengthMm: 4924, widthMm: 2019, heightMm: 1795, wheelbaseMm: 2995, bootSpaceLitres: 825, fuelTankLitres: 85, kerbWeightKg: 2130, airbags: 9, fuelEconomyCombined: 9.1, fuelEconomyCity: 11.0, fuelEconomyHighway: 7.9 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'glacier-blue', 'champagne-gold'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'night-vision', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'massage-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', 'power-tailgate', 'air-suspension', 'sport-mode', 'ambient-lighting', 'premium-sound-system', 'navigation-system'],
          description: 'The Mercedes-Benz GLE 450 AMG Line combines a powerful inline-6 engine with luxurious comfort and cutting-edge technology.',
          costs: { depreciation: 5200, insurance: 2600, fuel: 1350, service: 1100 },
        },
      ],
    },

    // 10. Mercedes-AMG G-Class
    {
      modelName: 'G-Class',
      modelSlug: 'g-class',
      brandSlug: 'mercedes-benz',
      bodyType: 'SUV',
      genName: 'W463 Generation',
      genSlug: 'g-class-w463',
      variants: [
        {
          variantCode: 'G63-AMG-25',
          name: 'AMG G 63 V8 Biturbo',
          slug: 'mercedes-amg-g63-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: '4wd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 3982, cylinders: 8, powerHp: 585, torqueNm: 850, aspiration: 'twin-turbo' },
          priceAED: 890000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 240, acceleration0To100Kph: 4.5, lengthMm: 4873, widthMm: 1984, heightMm: 1966, wheelbaseMm: 2890, bootSpaceLitres: 454, fuelTankLitres: 100, kerbWeightKg: 2560, airbags: 10, fuelEconomyCombined: 13.1, fuelEconomyCity: 16.5, fuelEconomyHighway: 11.2 },
          colorSlugs: ['midnight-black', 'pearl-white', 'nardo-grey', 'graphite-grey', 'desert-sand'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'active-exhaust-system', 'sport-mode', 'launch-control', 'massage-seats', 'ventilated-front-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'digital-instrument-cluster', 'matrix-led-headlights', 'ambient-lighting', 'premium-sound-system'],
          description: 'The Mercedes-AMG G 63 combines handcrafted V8 biturbo power, uncompromising luxury, and timeless status.',
          costs: { depreciation: 9500, insurance: 5000, fuel: 2800, service: 1800 },
        },
      ],
    },

    // 11. Land Rover Defender 110
    {
      modelName: 'Defender 110',
      modelSlug: 'defender-110',
      brandSlug: 'land-rover',
      bodyType: 'SUV',
      genName: 'L663 Generation',
      genSlug: 'defender-l663',
      variants: [
        {
          variantCode: 'DEF-110-V8-25',
          name: '110 V8 Supercharged 5.0L',
          slug: 'land-rover-defender-110-v8-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: '4wd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 4999, cylinders: 8, powerHp: 525, torqueNm: 625, aspiration: 'supercharged' },
          priceAED: 540000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 240, acceleration0To100Kph: 5.2, lengthMm: 5018, widthMm: 2008, heightMm: 1967, wheelbaseMm: 3022, bootSpaceLitres: 857, fuelTankLitres: 90, kerbWeightKg: 2603, airbags: 8, fuelEconomyCombined: 12.8, fuelEconomyCity: 15.1, fuelEconomyHighway: 10.9 },
          colorSlugs: ['midnight-black', 'pearl-white', 'british-racing-green', 'desert-sand', 'graphite-grey'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'terrain-management', 'air-suspension', 'panoramic-sunroof', 'ventilated-front-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'digital-instrument-cluster', 'matrix-led-headlights', 'active-exhaust-system'],
          description: 'The Land Rover Defender 110 V8 represents modern British luxury paired with unstoppable off-road endurance.',
          costs: { depreciation: 6800, insurance: 3400, fuel: 2200, service: 1400 },
        },
        {
          variantCode: 'DEF-110-SE-P400-25',
          name: 'Defender 110 SE P400',
          slug: 'land-rover-defender-110-se-p400-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 2996, cylinders: 6, powerHp: 400, torqueNm: 550, aspiration: 'twin-turbo' },
          priceAED: 499000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 209, acceleration0To100Kph: 5.4, lengthMm: 5018, widthMm: 2008, heightMm: 1966, wheelbaseMm: 3022, bootSpaceLitres: 786, fuelTankLitres: 90, kerbWeightKg: 2380, airbags: 7, fuelEconomyCombined: 11.2, fuelEconomyCity: 13.0, fuelEconomyHighway: 9.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'forest-green', 'desert-sand'],
          featureSlugs: ['adaptive-cruise-control', 'terrain-management', 'air-suspension', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', 'power-tailgate', 'roof-rails', 'running-boards', 'night-vision'],
          description: 'The Land Rover Defender 110 SE P400 combines legendary off-road capability with modern luxury and 400hp performance.',
          costs: { depreciation: 6800, insurance: 3200, fuel: 1600, service: 1400 },
        },
      ],
    },

    // 12. Porsche 911
    {
      modelName: '911',
      modelSlug: '911',
      brandSlug: 'porsche',
      bodyType: 'Coupe',
      genName: '992.2 Generation',
      genSlug: '911-992',
      variants: [
        {
          variantCode: '911-GT3-RS-25',
          name: 'GT3 RS 4.0L Atmospheric',
          slug: 'porsche-911-gt3-rs-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'rwd',
          seatingCapacity: 2,
          doors: 2,
          engine: { displacementCc: 3996, cylinders: 6, powerHp: 525, torqueNm: 465 },
          priceAED: 990000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 296, acceleration0To100Kph: 3.2, lengthMm: 4572, widthMm: 1900, heightMm: 1322, wheelbaseMm: 2457, bootSpaceLitres: 132, fuelTankLitres: 64, kerbWeightKg: 1450, airbags: 6, fuelEconomyCombined: 13.4, fuelEconomyCity: 18.2, fuelEconomyHighway: 10.3 },
          colorSlugs: ['racing-yellow', 'miami-blue', 'nardo-grey', 'pearl-white', 'midnight-black'],
          featureSlugs: ['launch-control', 'sport-mode', 'carbon-ceramic-brakes', 'active-exhaust-system', 'digital-instrument-cluster', 'matrix-led-headlights', 'apple-carplay', 'android-auto', 'parking-sensors', '360-degree-camera'],
          description: 'The Porsche 911 GT3 RS is motorsport engineering distilled into a street-legal track weapon.',
          costs: { depreciation: 8200, insurance: 5800, fuel: 2100, service: 2000 },
        },
      ],
    },

    // 13. Porsche Cayenne
    {
      modelName: 'Cayenne',
      modelSlug: 'cayenne',
      brandSlug: 'porsche',
      bodyType: 'SUV',
      genName: 'E3 Facelift',
      genSlug: 'cayenne-e3',
      variants: [
        {
          variantCode: 'CAYENNE-30-25',
          name: 'Cayenne 3.0T V6',
          slug: 'porsche-cayenne-3-0t-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 2894, cylinders: 6, powerHp: 348, torqueNm: 500, aspiration: 'twin-turbo' },
          priceAED: 485000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 253, acceleration0To100Kph: 5.9, lengthMm: 4918, widthMm: 1983, heightMm: 1696, wheelbaseMm: 2895, bootSpaceLitres: 771, fuelTankLitres: 90, kerbWeightKg: 2170, airbags: 8, fuelEconomyCombined: 9.4, fuelEconomyCity: 11.2, fuelEconomyHighway: 8.0 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'forest-green', 'glacier-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'automatic-emergency-braking', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'memory-seats', 'massage-seats', '360-degree-camera', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'parking-sensors', 'power-tailgate', 'air-suspension', 'sport-mode', 'launch-control', 'ambient-lighting', 'premium-sound-system', 'navigation-system'],
          description: 'The Porsche Cayenne 3.0T combines Porsche sports DNA with SUV practicality for the definitive driver SUV.',
          costs: { depreciation: 6500, insurance: 3400, fuel: 1450, service: 1500 },
        },
      ],
    },

    // 14. Tesla Model Y
    {
      modelName: 'Model Y',
      modelSlug: 'model-y',
      brandSlug: 'tesla',
      bodyType: 'SUV',
      genName: '1st Generation',
      genSlug: 'model-y-gen1',
      variants: [
        {
          variantCode: 'TESLA-MY-PERF-25',
          name: 'Performance Dual Motor AWD',
          slug: 'tesla-model-y-performance-2025',
          modelYear: 2025,
          fuelType: 'electric',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 0, cylinders: 0, powerHp: 534, torqueNm: 660 },
          priceAED: 235000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 250, acceleration0To100Kph: 3.7, lengthMm: 4751, widthMm: 1921, heightMm: 1624, wheelbaseMm: 2890, bootSpaceLitres: 854, fuelTankLitres: 0, kerbWeightKg: 1995, airbags: 8, fuelEconomyCombined: 0, fuelEconomyCity: 0, fuelEconomyHighway: 0 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'firestorm-red', 'glacier-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', '360-degree-camera', 'wireless-charging', 'keyless-entry', 'remote-start', 'matrix-led-headlights', 'launch-control', 'sport-mode', 'power-tailgate'],
          description: 'The Tesla Model Y Performance combines supercar acceleration, spacious utility, and industry-leading EV technology.',
          costs: { depreciation: 2800, insurance: 1600, fuel: 350, service: 300 },
        },
        {
          variantCode: 'MY-LR-AWD-25',
          name: 'Long Range AWD',
          slug: 'tesla-model-y-long-range-2025',
          modelYear: 2025,
          fuelType: 'electric',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 0, cylinders: 0, powerHp: 449, torqueNm: 693 },
          priceAED: 195000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 217, acceleration0To100Kph: 5.0, lengthMm: 4751, widthMm: 1921, heightMm: 1624, wheelbaseMm: 2890, bootSpaceLitres: 854, fuelTankLitres: 0, kerbWeightKg: 2003, airbags: 8, fuelEconomyCombined: 0, fuelEconomyCity: 0, fuelEconomyHighway: 0 },
          colorSlugs: ['lunar-white', 'midnight-black', 'titanium-silver', 'glacier-blue', 'firestorm-red'],
          featureSlugs: ['adaptive-cruise-control', 'lane-keeping-assist', 'automatic-emergency-braking', 'forward-collision-warning', 'blind-spot-monitoring', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'apple-carplay', 'wireless-charging', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', '360-degree-camera', 'digital-instrument-cluster', 'navigation-system', '4g-wifi-hotspot', 'power-tailgate', 'launch-control'],
          description: 'The Tesla Model Y Long Range AWD delivers over 500km range with instant electric torque and autopilot.',
          costs: { depreciation: 2600, insurance: 1500, fuel: 400, service: 200 },
        },
      ],
    },

    // 15. Ford Mustang
    {
      modelName: 'Mustang',
      modelSlug: 'mustang',
      brandSlug: 'ford',
      bodyType: 'Coupe',
      genName: 'S650 Generation',
      genSlug: 'mustang-s650',
      variants: [
        {
          variantCode: 'MUSTANG-DARKHORSE-25',
          name: 'Dark Horse 5.0L V8',
          slug: 'ford-mustang-dark-horse-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'rwd',
          seatingCapacity: 4,
          doors: 2,
          engine: { displacementCc: 5038, cylinders: 8, powerHp: 500, torqueNm: 567 },
          priceAED: 295000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 270, acceleration0To100Kph: 4.1, lengthMm: 4818, widthMm: 1917, heightMm: 1402, wheelbaseMm: 2718, bootSpaceLitres: 382, fuelTankLitres: 61, kerbWeightKg: 1795, airbags: 7, fuelEconomyCombined: 12.0, fuelEconomyCity: 15.0, fuelEconomyHighway: 9.8 },
          colorSlugs: ['glacier-blue', 'midnight-black', 'firestorm-red', 'nardo-grey', 'pearl-white'],
          featureSlugs: ['launch-control', 'sport-mode', 'active-exhaust-system', 'digital-instrument-cluster', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start'],
          description: 'The Ford Mustang Dark Horse unleashes track-ready American muscle with a naturally aspirated 500hp Coyote V8.',
          costs: { depreciation: 3800, insurance: 2100, fuel: 1900, service: 750 },
        },
      ],
    },

    // 16. Audi RS6 Avant
    {
      modelName: 'RS 6 Avant',
      modelSlug: 'rs-6-avant',
      brandSlug: 'audi',
      bodyType: 'Wagon',
      genName: 'C8 Generation',
      genSlug: 'rs6-c8',
      variants: [
        {
          variantCode: 'RS6-PERF-25',
          name: 'RS 6 Avant Performance 4.0L TFSI',
          slug: 'audi-rs6-avant-performance-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 3996, cylinders: 8, powerHp: 630, torqueNm: 850, aspiration: 'twin-turbo' },
          priceAED: 595000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 305, acceleration0To100Kph: 3.4, lengthMm: 4995, widthMm: 1951, heightMm: 1460, wheelbaseMm: 2929, bootSpaceLitres: 565, fuelTankLitres: 73, kerbWeightKg: 2090, airbags: 10, fuelEconomyCombined: 12.2, fuelEconomyCity: 15.4, fuelEconomyHighway: 9.8 },
          colorSlugs: ['nardo-grey', 'midnight-black', 'pearl-white', 'glacier-blue', 'firestorm-red'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'matrix-led-headlights', 'laser-headlights', 'air-suspension', 'sport-mode', 'launch-control', 'active-exhaust-system', 'carbon-ceramic-brakes', 'panoramic-sunroof', 'ventilated-front-seats', '360-degree-camera', 'head-up-display', 'digital-instrument-cluster'],
          description: 'The Audi RS 6 Avant Performance delivers 630 horsepower with everyday estate versatility and Quattro AWD dominance.',
          costs: { depreciation: 7200, insurance: 3800, fuel: 2000, service: 1500 },
        },
      ],
    },

    // 17. Audi Q8
    {
      modelName: 'Q8',
      modelSlug: 'q8',
      brandSlug: 'audi',
      bodyType: 'SUV',
      genName: 'F1 Generation',
      genSlug: 'q8-f1',
      variants: [
        {
          variantCode: 'Q8-55TFSI-25',
          name: 'Q8 55 TFSI quattro',
          slug: 'audi-q8-55-tfsi-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 2995, cylinders: 6, powerHp: 340, torqueNm: 500, aspiration: 'twin-turbo' },
          priceAED: 389000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1617654112368-307921291f42?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 246, acceleration0To100Kph: 5.9, lengthMm: 4986, widthMm: 1995, heightMm: 1705, wheelbaseMm: 2995, bootSpaceLitres: 605, fuelTankLitres: 85, kerbWeightKg: 2220, airbags: 8, fuelEconomyCombined: 9.5, fuelEconomyCity: 11.5, fuelEconomyHighway: 8.2 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'glacier-blue', 'graphite-grey', 'champagne-gold'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'night-vision', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'massage-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', 'power-tailgate', 'air-suspension', 'sport-mode', 'ambient-lighting', 'premium-sound-system', 'navigation-system'],
          description: 'The Audi Q8 55 TFSI quattro combines fastback coupe styling with flagship SUV performance.',
          costs: { depreciation: 5300, insurance: 2700, fuel: 1400, service: 1100 },
        },
      ],
    },

    // 18. Hyundai Tucson
    {
      modelName: 'Tucson',
      modelSlug: 'tucson',
      brandSlug: 'hyundai',
      bodyType: 'SUV',
      genName: 'NX4 Generation',
      genSlug: 'tucson-nx4',
      variants: [
        {
          variantCode: 'TUCSON-20-PREM-25',
          name: '2.0L GDI Premium AWD',
          slug: 'hyundai-tucson-2-0-gdi-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 1999, cylinders: 4, powerHp: 156, torqueNm: 192 },
          priceAED: 115000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 190, acceleration0To100Kph: 9.7, lengthMm: 4630, widthMm: 1865, heightMm: 1665, wheelbaseMm: 2755, bootSpaceLitres: 620, fuelTankLitres: 54, kerbWeightKg: 1605, airbags: 6, fuelEconomyCombined: 8.5, fuelEconomyCity: 10.0, fuelEconomyHighway: 7.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'firestorm-red', 'glacier-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-departure-warning', 'forward-collision-warning', 'dual-zone-climate-control', 'panoramic-sunroof', 'heated-front-seats', 'ventilated-front-seats', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', '360-degree-camera', 'led-headlights', 'digital-instrument-cluster', 'power-tailgate'],
          description: 'The Hyundai Tucson 2.0L GDI Premium blends bold parametric design and AWD capability at great value.',
          costs: { depreciation: 1600, insurance: 850, fuel: 1100, service: 450 },
        },
      ],
    },

    // 19. Hyundai Creta
    {
      modelName: 'Creta',
      modelSlug: 'creta',
      brandSlug: 'hyundai',
      bodyType: 'SUV',
      genName: 'SU2 Generation',
      genSlug: 'creta-su2',
      variants: [
        {
          variantCode: 'CRETA-15-SMART-25',
          name: '1.5L Smart FWD',
          slug: 'hyundai-creta-1-5-smart-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'fwd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 1497, cylinders: 4, powerHp: 115, torqueNm: 144 },
          priceAED: 79000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 170, acceleration0To100Kph: 12.5, lengthMm: 4300, widthMm: 1790, heightMm: 1635, wheelbaseMm: 2610, bootSpaceLitres: 433, fuelTankLitres: 50, kerbWeightKg: 1350, airbags: 6, fuelEconomyCombined: 7.0, fuelEconomyCity: 8.2, fuelEconomyHighway: 6.2 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'firestorm-red', 'glacier-blue', 'graphite-grey'],
          featureSlugs: ['lane-departure-warning', 'forward-collision-warning', 'apple-carplay', 'android-auto', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights'],
          description: 'The Hyundai Creta Smart offers compelling urban styling and features in a compact package.',
          costs: { depreciation: 1100, insurance: 650, fuel: 800, service: 350 },
        },
      ],
    },

    // 20. Kia Sportage
    {
      modelName: 'Sportage',
      modelSlug: 'sportage',
      brandSlug: 'kia',
      bodyType: 'SUV',
      genName: 'NQ5 Generation',
      genSlug: 'sportage-nq5',
      variants: [
        {
          variantCode: 'SPORTAGE-20-EX-25',
          name: '2.0L EX AWD',
          slug: 'kia-sportage-2-0-ex-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'awd',
          seatingCapacity: 5,
          doors: 5,
          engine: { displacementCc: 1999, cylinders: 4, powerHp: 149, torqueNm: 179 },
          priceAED: 99000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 185, acceleration0To100Kph: 10.3, lengthMm: 4515, widthMm: 1865, heightMm: 1670, wheelbaseMm: 2680, bootSpaceLitres: 543, fuelTankLitres: 52, kerbWeightKg: 1500, airbags: 6, fuelEconomyCombined: 8.3, fuelEconomyCity: 9.5, fuelEconomyHighway: 7.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'forest-green', 'firestorm-red'],
          featureSlugs: ['adaptive-cruise-control', 'lane-departure-warning', 'blind-spot-monitoring', 'dual-zone-climate-control', 'panoramic-sunroof', 'heated-front-seats', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'digital-instrument-cluster', 'power-tailgate'],
          description: 'The Kia Sportage 2.0L EX AWD delivers generous equipment levels and rugged AWD.',
          costs: { depreciation: 1400, insurance: 780, fuel: 1050, service: 420 },
        },
      ],
    },

    // 21. Lexus ES
    {
      modelName: 'ES',
      modelSlug: 'es',
      brandSlug: 'lexus',
      bodyType: 'Sedan',
      genName: 'ES7 Series',
      genSlug: 'es-seventh-gen',
      variants: [
        {
          variantCode: 'ES350-PREST-25',
          name: 'ES 350 Prestige',
          slug: 'lexus-es-350-prestige-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'fwd',
          seatingCapacity: 5,
          doors: 4,
          engine: { displacementCc: 3456, cylinders: 6, powerHp: 302, torqueNm: 361 },
          priceAED: 235000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 6.6, lengthMm: 4975, widthMm: 1865, heightMm: 1445, wheelbaseMm: 2870, bootSpaceLitres: 450, fuelTankLitres: 70, kerbWeightKg: 1730, airbags: 10, fuelEconomyCombined: 9.8, fuelEconomyCity: 11.5, fuelEconomyHighway: 8.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'deep-burgundy', 'navy-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'rear-cross-traffic-alert', 'driver-attention-monitor', 'automatic-emergency-braking', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'memory-seats', 'massage-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', 'ambient-lighting', 'premium-sound-system', 'navigation-system'],
          description: 'The Lexus ES 350 Prestige delivers legendary Japanese craftsmanship and ultra-quiet cabin luxury.',
          costs: { depreciation: 3300, insurance: 1700, fuel: 1250, service: 600 },
        },
      ],
    },

    // 22. Suzuki Ciaz
    {
      modelName: 'Ciaz',
      modelSlug: 'ciaz',
      brandSlug: 'suzuki',
      bodyType: 'Sedan',
      genName: '2nd Generation',
      genSlug: 'ciaz-gen2',
      variants: [
        {
          variantCode: 'CIAZ-ZXI-AT-25',
          name: 'ZXi 1.5L AT',
          slug: 'suzuki-ciaz-zxi-at-2025',
          modelYear: 2025,
          fuelType: 'petrol',
          transmissionType: 'automatic',
          drivetrain: 'fwd',
          seatingCapacity: 5,
          doors: 4,
          engine: { displacementCc: 1462, cylinders: 4, powerHp: 103, torqueNm: 138 },
          priceAED: 59000,
          availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 180, acceleration0To100Kph: 12.0, lengthMm: 4490, widthMm: 1730, heightMm: 1485, wheelbaseMm: 2650, bootSpaceLitres: 510, fuelTankLitres: 43, kerbWeightKg: 1050, airbags: 4, fuelEconomyCombined: 5.6, fuelEconomyCity: 6.8, fuelEconomyHighway: 4.9 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'glacier-blue', 'deep-burgundy'],
          featureSlugs: ['apple-carplay', 'android-auto', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'split-folding-rear-seats'],
          description: 'The Suzuki Ciaz ZXi AT delivers best-in-class rear legroom, high fuel efficiency, and dependable city motoring.',
          costs: { depreciation: 900, insurance: 500, fuel: 650, service: 300 },
        },
      ],
    },
  ];

  let modelsCount = 0;
  let gensCount = 0;
  let variantsCount = 0;

  for (const vData of allVehicles) {
    const brand = brandMap[vData.brandSlug];
    if (!brand) {
      console.warn(`Brand '${vData.brandSlug}' not found in DB! Skipping ${vData.modelName}`);
      continue;
    }

    // 1. Upsert Model
    const model = await VehicleModel.findOneAndUpdate(
      { slug: vData.modelSlug, brandId: brand._id },
      {
        $set: {
          brandId: brand._id,
          modelCode: `${brand.brandCode}-${vData.modelSlug.toUpperCase().slice(0, 5)}`,
          name: vData.modelName,
          slug: vData.modelSlug,
          bodyType: vData.bodyType,
          status: 'active',
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    modelsCount++;

    // 2. Upsert Generation
    const gen = await Generation.findOneAndUpdate(
      { slug: vData.genSlug, modelId: model._id },
      {
        $set: {
          modelId: model._id,
          generationCode: `${model.modelCode}-${vData.genSlug.toUpperCase().slice(0, 4)}`,
          name: vData.genName,
          slug: vData.genSlug,
          status: 'active',
          startYear: 2023,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    gensCount++;

    // 3. Upsert Variants & Associated Entities
    for (const v of vData.variants) {
      const variant = await Variant.findOneAndUpdate(
        { slug: v.slug },
        {
          $set: {
            modelId: model._id,
            generationId: gen._id,
            variantCode: v.variantCode,
            name: v.name,
            slug: v.slug,
            modelYear: v.modelYear,
            fuelType: v.fuelType,
            transmissionType: v.transmissionType,
            drivetrain: v.drivetrain,
            seatingCapacity: v.seatingCapacity,
            doors: v.doors,
            engine: v.engine,
            description: v.description,
            status: 'active',
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      variantsCount++;

      // Upsert Media
      await Media.findOneAndUpdate(
        { storageKey: `variants/${v.slug}-hero.jpg` },
        {
          $set: {
            folder: 'variants',
            entityType: 'variant',
            entityId: variant._id,
            mediaType: 'image',
            storageProvider: 'local',
            storageKey: `variants/${v.slug}-hero.jpg`,
            url: v.imageUrl,
            originalName: `${v.slug}-hero.jpg`,
            mimeType: 'image/jpeg',
            size: 512000,
            status: 'active',
            isPrimary: true,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

      // Upsert Specifications
      await Specification.findOneAndUpdate(
        { variantId: variant._id },
        {
          $set: {
            variantId: variant._id,
            performance: {
              topSpeedKph: v.specs.topSpeedKph,
              acceleration0To100Kph: v.specs.acceleration0To100Kph,
            },
            dimensions: {
              lengthMm: v.specs.lengthMm,
              widthMm: v.specs.widthMm,
              heightMm: v.specs.heightMm,
              wheelbaseMm: v.specs.wheelbaseMm,
              bootSpaceLitres: v.specs.bootSpaceLitres,
              kerbWeightKg: v.specs.kerbWeightKg,
            },
            fuelEconomy: {
              fuelTankLitres: v.specs.fuelTankLitres,
              combinedLPer100Km: v.specs.fuelEconomyCombined,
              cityLPer100Km: v.specs.fuelEconomyCity,
              highwayLPer100Km: v.specs.fuelEconomyHighway,
            },
            safety: {
              airbags: v.specs.airbags,
              abs: true,
              esp: true,
              isofix: true,
            },
            warranty: {
              years: 5,
              distanceKm: 150000,
            },
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

      // Upsert VariantMarket
      await VariantMarket.findOneAndUpdate(
        { variantId: variant._id, marketId: marketUAE._id },
        {
          $set: {
            variantId: variant._id,
            marketId: marketUAE._id,
            pricing: {
              amount: v.priceAED,
              currencyCode: 'AED',
              priceType: 'starting',
            },
            availabilityStatus: v.availabilityStatus,
            status: 'active',
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

      // Upsert VariantColors
      for (const colorSlug of v.colorSlugs) {
        const colorDoc = colorMap[colorSlug];
        if (colorDoc) {
          await VariantColor.findOneAndUpdate(
            { variantId: variant._id, colorId: colorDoc._id },
            {
              $set: {
                variantId: variant._id,
                colorId: colorDoc._id,
                availability: 'standard',
                status: 'active',
              },
            },
            { upsert: true }
          );
        }
      }

      // Upsert VariantFeatures
      for (const featSlug of v.featureSlugs) {
        const featDoc = featureMap[featSlug];
        if (featDoc) {
          await VariantFeature.findOneAndUpdate(
            { variantId: variant._id, featureId: featDoc._id },
            {
              $set: {
                variantId: variant._id,
                featureId: featDoc._id,
                availability: 'standard',
                status: 'active',
              },
            },
            { upsert: true }
          );
        }
      }

      // Upsert CostToOwn
      await CostToOwn.findOneAndUpdate(
        { variantId: variant._id, marketId: marketUAE._id },
        {
          $set: {
            variantId: variant._id,
            marketId: marketUAE._id,
            ownershipPeriod: 12,
            depreciation: v.costs.depreciation,
            insurance: v.costs.insurance,
            fuelCostAssumptions: v.costs.fuel,
            service: v.costs.service,
            maintenance: 500,
            registration: 450,
            otherOwnershipCosts: 200,
            totalEstimatedCost: v.costs.depreciation + v.costs.insurance + v.costs.fuel + v.costs.service + 1150,
            status: 'active',
          },
        },
        { upsert: true }
      );
    }
  }

  const finalModelsCount = await VehicleModel.countDocuments();
  const finalGensCount = await Generation.countDocuments();
  const finalVariantsCount = await Variant.countDocuments();

  console.log('\n======================================================');
  console.log('✅ ALL VEHICLES, MODELS & VARIANTS RESTORED!');
  console.log('======================================================');
  console.log(`- Total Models in DB: ${finalModelsCount}`);
  console.log(`- Total Generations in DB: ${finalGensCount}`);
  console.log(`- Total Variants in DB: ${finalVariantsCount}`);
  console.log('======================================================\n');

  await mongoose.disconnect();
}

seedAllVehicles().catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
});
