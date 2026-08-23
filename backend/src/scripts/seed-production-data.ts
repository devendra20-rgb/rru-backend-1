import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

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
import { Review } from '../modules/reviews/review.model';
import { Article } from '../modules/articles/article.model';
import { User } from '../modules/users/user.model';
import { Color, VariantColor } from '../modules/catalog/colors/color.model';
import { Feature, VariantFeature } from '../modules/catalog/features/feature.model';

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  // Clear ALL relevant collections
  console.log('Clearing old data...');
  await Promise.all([
    Brand.deleteMany({}),
    VehicleModel.deleteMany({}),
    Generation.deleteMany({}),
    Variant.deleteMany({}),
    Specification.deleteMany({}),
    Market.deleteMany({}),
    VariantMarket.deleteMany({}),
    Media.deleteMany({}),
    CostToOwn.deleteMany({}),
    Review.deleteMany({}),
    Article.deleteMany({}),
    Color.deleteMany({}),
    VariantColor.deleteMany({}),
    Feature.deleteMany({}),
    VariantFeature.deleteMany({}),
  ]);

  // Admin user
  let adminUser = await User.findOne({ email: 'admin@example.com' });
  if (!adminUser) {
    adminUser = await User.create({
      username: 'RRU Editorial',
      email: 'admin@example.com',
      password: '$2b$10$hAPnrEqFwoXEFaPBCKUDfOBk/1l5dm5SUNeOuXkyO82jV2YCWVThy',
      role: 'admin',
      status: 'active',
    });
  }

  // ===================== 1. COLORS =====================
  console.log('Seeding Colors...');
  const exteriorColors = await Color.insertMany([
    { name: 'Pearl White', slug: 'pearl-white', hexCode: '#F5F5F0', type: 'exterior' },
    { name: 'Midnight Black', slug: 'midnight-black', hexCode: '#0A0A0A', type: 'exterior' },
    { name: 'Titanium Silver', slug: 'titanium-silver', hexCode: '#A8A9AD', type: 'exterior' },
    { name: 'Desert Sand', slug: 'desert-sand', hexCode: '#C4A882', type: 'exterior' },
    { name: 'Firestorm Red', slug: 'firestorm-red', hexCode: '#C0392B', type: 'exterior' },
    { name: 'Glacier Blue', slug: 'glacier-blue', hexCode: '#2E86AB', type: 'exterior' },
    { name: 'Graphite Grey', slug: 'graphite-grey', hexCode: '#4A4A4A', type: 'exterior' },
    { name: 'Champagne Gold', slug: 'champagne-gold', hexCode: '#C5A028', type: 'exterior' },
    { name: 'Forest Green', slug: 'forest-green', hexCode: '#2D6A4F', type: 'exterior' },
    { name: 'Lunar White', slug: 'lunar-white', hexCode: '#FAFAFA', type: 'exterior' },
    { name: 'Deep Burgundy', slug: 'deep-burgundy', hexCode: '#6D0F1E', type: 'exterior' },
    { name: 'Navy Blue', slug: 'navy-blue', hexCode: '#1B3A6B', type: 'exterior' },
  ]);

  const interiorColors = await Color.insertMany([
    { name: 'Black Leather', slug: 'black-leather', hexCode: '#1A1A1A', type: 'interior' },
    { name: 'Beige Caramel', slug: 'beige-caramel', hexCode: '#C8A97E', type: 'interior' },
    { name: 'Dark Brown', slug: 'dark-brown', hexCode: '#4A2C17', type: 'interior' },
    { name: 'Red Sport Leather', slug: 'red-sport-leather', hexCode: '#8B1A1A', type: 'interior' },
    { name: 'Ivory White', slug: 'ivory-white', hexCode: '#F8F4E8', type: 'interior' },
    { name: 'Graphite Fabric', slug: 'graphite-fabric', hexCode: '#3D3D3D', type: 'interior' },
  ]);

  const allColors = [...exteriorColors, ...interiorColors];
  const colorMap: Record<string, any> = {};
  allColors.forEach(c => { colorMap[c.slug] = c; });
  console.log(`  ${allColors.length} colors seeded`);

  // ===================== 2. FEATURES =====================
  console.log('Seeding Features...');
  const featuresData = [
    // Safety
    { name: 'Forward Collision Warning', slug: 'forward-collision-warning', category: 'safety', description: 'Alerts driver of imminent forward collision' },
    { name: 'Automatic Emergency Braking', slug: 'automatic-emergency-braking', category: 'safety', description: 'Auto-brakes to prevent or reduce collision severity' },
    { name: 'Blind Spot Monitoring', slug: 'blind-spot-monitoring', category: 'safety', description: 'Warns of vehicles in blind spots' },
    { name: 'Lane Departure Warning', slug: 'lane-departure-warning', category: 'safety', description: 'Alerts when drifting out of lane without signaling' },
    { name: 'Lane Keeping Assist', slug: 'lane-keeping-assist', category: 'safety', description: 'Steers vehicle back into lane' },
    { name: 'Adaptive Cruise Control', slug: 'adaptive-cruise-control', category: 'safety', description: 'Maintains safe distance from vehicle ahead' },
    { name: 'Rear Cross Traffic Alert', slug: 'rear-cross-traffic-alert', category: 'safety', description: 'Warns of approaching cross traffic when reversing' },
    { name: 'Driver Attention Monitor', slug: 'driver-attention-monitor', category: 'safety', description: 'Monitors driver alertness and warns of drowsiness' },
    { name: 'Hill Start Assist', slug: 'hill-start-assist', category: 'safety', description: 'Prevents rollback when starting on a hill' },
    { name: 'Electronic Stability Control', slug: 'electronic-stability-control', category: 'safety', description: 'Prevents skidding and loss of traction' },
    { name: '360-Degree Camera', slug: '360-degree-camera', category: 'safety', description: 'Bird eye view of surroundings for parking' },
    { name: 'Night Vision', slug: 'night-vision', category: 'safety', description: 'Infrared night vision for pedestrian detection' },
    // Comfort
    { name: 'Heated Front Seats', slug: 'heated-front-seats', category: 'comfort', description: 'Electrically heated front seats' },
    { name: 'Ventilated Front Seats', slug: 'ventilated-front-seats', category: 'comfort', description: 'Cooling ventilation in front seats for UAE summers' },
    { name: 'Heated Rear Seats', slug: 'heated-rear-seats', category: 'comfort', description: 'Electrically heated rear seats' },
    { name: 'Ventilated Rear Seats', slug: 'ventilated-rear-seats', category: 'comfort', description: 'Cooling ventilation in rear seats' },
    { name: 'Massage Seats', slug: 'massage-seats', category: 'comfort', description: 'Integrated seat massage function' },
    { name: 'Memory Seats', slug: 'memory-seats', category: 'comfort', description: 'Saves and recalls seat and mirror positions' },
    { name: 'Panoramic Sunroof', slug: 'panoramic-sunroof', category: 'comfort', description: 'Full-width glass roof panel' },
    { name: 'Sunroof', slug: 'sunroof', category: 'comfort', description: 'Standard tilting glass sunroof' },
    { name: 'Ambient Lighting', slug: 'ambient-lighting', category: 'comfort', description: 'Customizable interior mood lighting' },
    { name: 'Dual-Zone Climate Control', slug: 'dual-zone-climate-control', category: 'comfort', description: 'Independent temperature zones for driver and passenger' },
    { name: 'Tri-Zone Climate Control', slug: 'tri-zone-climate-control', category: 'comfort', description: 'Independent temperature zones for all three rows' },
    // Infotainment
    { name: 'Apple CarPlay', slug: 'apple-carplay', category: 'infotainment', description: 'Wireless Apple CarPlay integration' },
    { name: 'Android Auto', slug: 'android-auto', category: 'infotainment', description: 'Wireless Android Auto integration' },
    { name: 'Premium Sound System', slug: 'premium-sound-system', category: 'infotainment', description: 'High-end branded audio system (JBL/Harman/Bose)' },
    { name: '4G Wi-Fi Hotspot', slug: '4g-wifi-hotspot', category: 'infotainment', description: 'Built-in 4G LTE internet hotspot' },
    { name: 'Head-Up Display', slug: 'head-up-display', category: 'infotainment', description: 'Speed and navigation projected onto windshield' },
    { name: 'Digital Instrument Cluster', slug: 'digital-instrument-cluster', category: 'infotainment', description: 'Fully digital configurable gauge cluster' },
    { name: 'Wireless Charging', slug: 'wireless-charging', category: 'infotainment', description: 'Qi wireless charging pad' },
    { name: 'Navigation System', slug: 'navigation-system', category: 'infotainment', description: 'Built-in GPS navigation with live traffic' },
    // Exterior
    { name: 'LED Headlights', slug: 'led-headlights', category: 'exterior', description: 'Full LED adaptive headlights' },
    { name: 'Matrix LED Headlights', slug: 'matrix-led-headlights', category: 'exterior', description: 'Intelligent pixel LED headlights with glare elimination' },
    { name: 'Power Tailgate', slug: 'power-tailgate', category: 'exterior', description: 'Hands-free or button-operated rear door' },
    { name: 'Roof Rails', slug: 'roof-rails', category: 'exterior', description: 'Integrated roof rails for cargo accessories' },
    { name: 'Running Boards', slug: 'running-boards', category: 'exterior', description: 'Side step boards for easy entry and exit' },
    // Convenience
    { name: 'Keyless Entry', slug: 'keyless-entry', category: 'convenience', description: 'Entry without physically pressing key fob' },
    { name: 'Push Button Start', slug: 'push-button-start', category: 'convenience', description: 'Engine start without inserting key' },
    { name: 'Remote Start', slug: 'remote-start', category: 'convenience', description: 'Start engine remotely to pre-cool cabin' },
    { name: 'Power Adjustable Seats', slug: 'power-adjustable-seats', category: 'convenience', description: 'Electrically adjusted seat positions' },
    { name: 'Power Folding Mirrors', slug: 'power-folding-mirrors', category: 'convenience', description: 'Auto-folding door mirrors' },
    { name: 'Parking Sensors Front and Rear', slug: 'parking-sensors', category: 'convenience', description: 'Ultrasonic sensors for parking assistance' },
    { name: 'Auto-Dimming Rear Mirror', slug: 'auto-dimming-mirror', category: 'convenience', description: 'Mirror darkens automatically to reduce glare' },
    { name: 'Rain-Sensing Wipers', slug: 'rain-sensing-wipers', category: 'convenience', description: 'Automatically activates based on rain intensity' },
    // Performance
    { name: 'Sport Mode', slug: 'sport-mode', category: 'performance', description: 'Sharpened throttle, steering, and gearbox response' },
    { name: 'Terrain Management System', slug: 'terrain-management', category: 'performance', description: 'Selectable off-road driving modes for sand and mud' },
    { name: 'Air Suspension', slug: 'air-suspension', category: 'performance', description: 'Electronically adjustable air suspension height' },
    { name: 'Launch Control', slug: 'launch-control', category: 'performance', description: 'Optimized maximum-acceleration start sequence' },
  ] as const;

  const features = await Feature.insertMany([...featuresData] as any[]);
  const featureMap: Record<string, any> = {};
  features.forEach(f => { featureMap[f.slug] = f; });
  console.log(`  ${features.length} features seeded`);

  // ===================== 3. MARKETS =====================
  console.log('Seeding Market...');
  const marketUAE = await Market.create({
    code: 'UAE',
    name: 'United Arab Emirates',
    countryCode: 'AE',
    currencyCode: 'AED',
    status: 'active',
  });

  // ===================== 4. BRANDS =====================
  console.log('Seeding Brands...');
  const brandsData = [
    { brandCode: 'TOYOTA', name: 'Toyota', slug: 'toyota', originCountryCode: 'JP', status: 'active' },
    { brandCode: 'NISSAN', name: 'Nissan', slug: 'nissan', originCountryCode: 'JP', status: 'active' },
    { brandCode: 'BMW', name: 'BMW', slug: 'bmw', originCountryCode: 'DE', status: 'active' },
    { brandCode: 'MERCEDES', name: 'Mercedes-Benz', slug: 'mercedes-benz', originCountryCode: 'DE', status: 'active' },
    { brandCode: 'HYUNDAI', name: 'Hyundai', slug: 'hyundai', originCountryCode: 'KR', status: 'active' },
    { brandCode: 'KIA', name: 'Kia', slug: 'kia', originCountryCode: 'KR', status: 'active' },
    { brandCode: 'AUDI', name: 'Audi', slug: 'audi', originCountryCode: 'DE', status: 'active' },
    { brandCode: 'LEXUS', name: 'Lexus', slug: 'lexus', originCountryCode: 'JP', status: 'active' },
    { brandCode: 'TESLA', name: 'Tesla', slug: 'tesla', originCountryCode: 'US', status: 'active' },
    { brandCode: 'FORD', name: 'Ford', slug: 'ford', originCountryCode: 'US', status: 'active' },
    { brandCode: 'CHEVROLET', name: 'Chevrolet', slug: 'chevrolet', originCountryCode: 'US', status: 'active' },
    { brandCode: 'HONDA', name: 'Honda', slug: 'honda', originCountryCode: 'JP', status: 'active' },
    { brandCode: 'LANDROVER', name: 'Land Rover', slug: 'land-rover', originCountryCode: 'GB', status: 'active' },
    { brandCode: 'PORSCHE', name: 'Porsche', slug: 'porsche', originCountryCode: 'DE', status: 'active' },
  ];
  const brands = await Brand.insertMany(brandsData);
  const brandMap: Record<string, any> = {};
  brands.forEach(b => { brandMap[b.slug] = b; });
  console.log(`  ${brands.length} brands seeded`);

  // ===================== 5. VEHICLES =====================
  console.log('Seeding Vehicles...');

  interface VehicleSeed {
    modelName: string; modelSlug: string; brandSlug: string; bodyType: string;
    genName: string; genSlug: string;
    variants: {
      variantCode: string; name: string; slug: string; modelYear: number;
      fuelType: string; transmissionType: string; drivetrain: string;
      seatingCapacity: number; doors: number;
      engine: { displacementCc: number; cylinders: number; powerHp: number; torqueNm: number; aspiration?: string };
      priceAED: number; availabilityStatus: 'available' | 'unavailable' | 'upcoming' | 'discontinued';
      imageUrl: string;
      specs: { topSpeedKph: number; acceleration0To100Kph: number; lengthMm: number; widthMm: number; heightMm: number; wheelbaseMm: number; bootSpaceLitres: number; fuelTankLitres: number; kerbWeightKg: number; airbags: number; fuelEconomyCombined: number; fuelEconomyCity: number; fuelEconomyHighway: number };
      colorSlugs: string[];
      featureSlugs: string[];
      description: string;
      costs: { depreciation: number; insurance: number; fuel: number; service: number };
    }[];
  }

  const vehiclesToSeed: VehicleSeed[] = [
    {
      modelName: 'Land Cruiser', modelSlug: 'land-cruiser', brandSlug: 'toyota', bodyType: 'SUV',
      genName: '300 Series', genSlug: 'lc-300',
      variants: [
        {
          variantCode: 'LC-GXR-V6-25', name: 'GXR V6', slug: 'toyota-land-cruiser-gxr-v6-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: '4wd',
          seatingCapacity: 7, doors: 5,
          engine: { displacementCc: 3445, cylinders: 6, powerHp: 409, torqueNm: 650, aspiration: 'twin-turbo' },
          priceAED: 335000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1669215420024-7d7e5e20ede4?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 7.0, lengthMm: 4985, widthMm: 1980, heightMm: 1870, wheelbaseMm: 2850, bootSpaceLitres: 308, fuelTankLitres: 110, kerbWeightKg: 2500, airbags: 10, fuelEconomyCombined: 11.4, fuelEconomyCity: 13.2, fuelEconomyHighway: 9.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'desert-sand', 'graphite-grey'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'panoramic-sunroof', 'ventilated-front-seats', '360-degree-camera', 'terrain-management', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'digital-instrument-cluster', 'power-tailgate', 'roof-rails'],
          description: 'The Toyota Land Cruiser GXR V6 is the ultimate all-terrain luxury SUV, built to conquer any terrain while delivering top-tier comfort.',
          costs: { depreciation: 4800, insurance: 2200, fuel: 1850, service: 800 },
        },
        {
          variantCode: 'LC-VXR-V6-25', name: 'VXR V6 Twin Turbo', slug: 'toyota-land-cruiser-vxr-v6-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: '4wd',
          seatingCapacity: 7, doors: 5,
          engine: { displacementCc: 3445, cylinders: 6, powerHp: 409, torqueNm: 650, aspiration: 'twin-turbo' },
          priceAED: 390000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1669215420024-7d7e5e20ede4?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 6.8, lengthMm: 4985, widthMm: 1980, heightMm: 1870, wheelbaseMm: 2850, bootSpaceLitres: 308, fuelTankLitres: 110, kerbWeightKg: 2550, airbags: 10, fuelEconomyCombined: 11.8, fuelEconomyCity: 13.8, fuelEconomyHighway: 10.2 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'champagne-gold'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'panoramic-sunroof', 'ventilated-front-seats', 'ventilated-rear-seats', '360-degree-camera', 'terrain-management', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'matrix-led-headlights', 'digital-instrument-cluster', 'power-tailgate', 'massage-seats', 'memory-seats', 'air-suspension'],
          description: 'The flagship Toyota Land Cruiser VXR Twin Turbo offers maximum comfort, luxury, and off-road capability.',
          costs: { depreciation: 5600, insurance: 2500, fuel: 1950, service: 900 },
        },
      ],
    },
    {
      modelName: 'Camry', modelSlug: 'camry', brandSlug: 'toyota', bodyType: 'Sedan',
      genName: 'XV80 Generation', genSlug: 'camry-xv80',
      variants: [
        {
          variantCode: 'CAMRY-35-GRANDE-25', name: '3.5L Grande', slug: 'toyota-camry-grande-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'fwd',
          seatingCapacity: 5, doors: 4,
          engine: { displacementCc: 3456, cylinders: 6, powerHp: 298, torqueNm: 362 },
          priceAED: 145000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 220, acceleration0To100Kph: 6.3, lengthMm: 4885, widthMm: 1840, heightMm: 1445, wheelbaseMm: 2825, bootSpaceLitres: 493, fuelTankLitres: 60, kerbWeightKg: 1635, airbags: 8, fuelEconomyCombined: 9.2, fuelEconomyCity: 10.8, fuelEconomyHighway: 8.1 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'firestorm-red', 'glacier-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'ventilated-front-seats', 'heated-front-seats', 'panoramic-sunroof', 'apple-carplay', 'android-auto', 'wireless-charging', 'head-up-display', 'digital-instrument-cluster', 'keyless-entry', 'push-button-start', 'parking-sensors', '360-degree-camera', 'led-headlights'],
          description: 'The Toyota Camry Grande offers an exceptional blend of performance and executive comfort in a refined full-size sedan.',
          costs: { depreciation: 2000, insurance: 1000, fuel: 1100, service: 500 },
        },
        {
          variantCode: 'CAMRY-HYB-27', name: '2.5L Hybrid XLE', slug: 'toyota-camry-hybrid-2027',
          modelYear: 2027, fuelType: 'hybrid', transmissionType: 'cvt', drivetrain: 'fwd',
          seatingCapacity: 5, doors: 4,
          engine: { displacementCc: 2487, cylinders: 4, powerHp: 218, torqueNm: 221 },
          priceAED: 125000, availabilityStatus: 'upcoming',
          imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 200, acceleration0To100Kph: 7.2, lengthMm: 4885, widthMm: 1840, heightMm: 1445, wheelbaseMm: 2825, bootSpaceLitres: 428, fuelTankLitres: 50, kerbWeightKg: 1670, airbags: 8, fuelEconomyCombined: 4.8, fuelEconomyCity: 4.5, fuelEconomyHighway: 5.2 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'glacier-blue', 'forest-green'],
          featureSlugs: ['adaptive-cruise-control', 'lane-keeping-assist', 'apple-carplay', 'android-auto', 'wireless-charging', 'digital-instrument-cluster', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights'],
          description: 'The upcoming 2027 Toyota Camry Hybrid XLE delivers superior fuel economy with refined comfort.',
          costs: { depreciation: 1700, insurance: 900, fuel: 580, service: 400 },
        },
      ],
    },
    {
      modelName: 'Prado', modelSlug: 'prado', brandSlug: 'toyota', bodyType: 'SUV',
      genName: 'J250 Series', genSlug: 'prado-j250',
      variants: [
        {
          variantCode: 'PRADO-TXL-25', name: 'TXL 2.4L Turbo', slug: 'toyota-prado-txl-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: '4wd',
          seatingCapacity: 7, doors: 5,
          engine: { displacementCc: 2393, cylinders: 4, powerHp: 278, torqueNm: 430, aspiration: 'turbo' },
          priceAED: 220000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 200, acceleration0To100Kph: 7.6, lengthMm: 4920, widthMm: 1980, heightMm: 1895, wheelbaseMm: 2850, bootSpaceLitres: 193, fuelTankLitres: 87, kerbWeightKg: 2250, airbags: 9, fuelEconomyCombined: 9.8, fuelEconomyCity: 11.2, fuelEconomyHighway: 8.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'desert-sand', 'graphite-grey', 'forest-green'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'terrain-management', 'panoramic-sunroof', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', '360-degree-camera', 'led-headlights', 'power-tailgate', 'roof-rails', 'running-boards'],
          description: 'The new Toyota Prado features a modern turbocharged engine with legendary Toyota off-road capability.',
          costs: { depreciation: 3200, insurance: 1500, fuel: 1300, service: 700 },
        },
      ],
    },
    {
      modelName: 'Patrol', modelSlug: 'patrol', brandSlug: 'nissan', bodyType: 'SUV',
      genName: 'Y62 Series 6', genSlug: 'patrol-y62-s6',
      variants: [
        {
          variantCode: 'PATROL-LE-PLAT-25', name: 'LE Platinum V8', slug: 'nissan-patrol-le-platinum-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: '4wd',
          seatingCapacity: 8, doors: 5,
          engine: { displacementCc: 5552, cylinders: 8, powerHp: 405, torqueNm: 560 },
          priceAED: 340000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 6.9, lengthMm: 5170, widthMm: 1995, heightMm: 1940, wheelbaseMm: 3075, bootSpaceLitres: 322, fuelTankLitres: 140, kerbWeightKg: 2740, airbags: 9, fuelEconomyCombined: 14.5, fuelEconomyCity: 17.0, fuelEconomyHighway: 12.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'champagne-gold', 'deep-burgundy'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-departure-warning', 'tri-zone-climate-control', 'ventilated-front-seats', 'ventilated-rear-seats', 'heated-rear-seats', 'massage-seats', 'memory-seats', '360-degree-camera', 'panoramic-sunroof', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'matrix-led-headlights', 'digital-instrument-cluster', 'power-tailgate', 'roof-rails', 'running-boards', 'terrain-management'],
          description: 'The Nissan Patrol LE Platinum is the benchmark of full-size 4WD luxury in the UAE with commanding V8 power.',
          costs: { depreciation: 4900, insurance: 2200, fuel: 2400, service: 900 },
        },
        {
          variantCode: 'PATROL-S-V8-25', name: 'S V8', slug: 'nissan-patrol-s-v8-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: '4wd',
          seatingCapacity: 8, doors: 5,
          engine: { displacementCc: 5552, cylinders: 8, powerHp: 405, torqueNm: 560 },
          priceAED: 248000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 7.1, lengthMm: 5170, widthMm: 1995, heightMm: 1940, wheelbaseMm: 3075, bootSpaceLitres: 322, fuelTankLitres: 140, kerbWeightKg: 2690, airbags: 7, fuelEconomyCombined: 14.8, fuelEconomyCity: 17.5, fuelEconomyHighway: 12.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'dual-zone-climate-control', 'ventilated-front-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'digital-instrument-cluster', 'power-tailgate', 'running-boards'],
          description: 'The Nissan Patrol S V8 delivers V8 muscle and solid SUV capability at an accessible entry price.',
          costs: { depreciation: 3500, insurance: 1700, fuel: 2500, service: 800 },
        },
      ],
    },
    {
      modelName: 'X-Terra', modelSlug: 'x-terra', brandSlug: 'nissan', bodyType: 'SUV',
      genName: 'N60 Generation', genSlug: 'xterra-n60',
      variants: [
        {
          variantCode: 'XTERRA-PRO4X-25', name: 'PRO-4X 2.5L', slug: 'nissan-xterra-pro4x-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: '4wd',
          seatingCapacity: 7, doors: 5,
          engine: { displacementCc: 2488, cylinders: 4, powerHp: 182, torqueNm: 242 },
          priceAED: 128000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1614543393951-f2f2e90c5af8?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 185, acceleration0To100Kph: 10.5, lengthMm: 4697, widthMm: 1903, heightMm: 1736, wheelbaseMm: 2705, bootSpaceLitres: 348, fuelTankLitres: 80, kerbWeightKg: 1980, airbags: 6, fuelEconomyCombined: 10.5, fuelEconomyCity: 12.0, fuelEconomyHighway: 9.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'firestorm-red', 'graphite-grey'],
          featureSlugs: ['terrain-management', 'apple-carplay', 'android-auto', 'dual-zone-climate-control', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'power-tailgate', 'roof-rails', 'running-boards'],
          description: 'The Nissan X-Terra PRO-4X is a proper off-road SUV designed for UAE desert adventure.',
          costs: { depreciation: 1700, insurance: 900, fuel: 1350, service: 500 },
        },
      ],
    },
    {
      modelName: 'X5', modelSlug: 'x5', brandSlug: 'bmw', bodyType: 'SUV',
      genName: 'G05 LCI', genSlug: 'x5-g05',
      variants: [
        {
          variantCode: 'X5-40I-MPKG-25', name: 'xDrive40i M Package', slug: 'bmw-x5-xdrive40i-m-package-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'awd',
          seatingCapacity: 5, doors: 5,
          engine: { displacementCc: 2998, cylinders: 6, powerHp: 382, torqueNm: 520, aspiration: 'twin-turbo' },
          priceAED: 398000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 250, acceleration0To100Kph: 5.4, lengthMm: 4922, widthMm: 2004, heightMm: 1745, wheelbaseMm: 2975, bootSpaceLitres: 650, fuelTankLitres: 83, kerbWeightKg: 2205, airbags: 10, fuelEconomyCombined: 9.6, fuelEconomyCity: 11.2, fuelEconomyHighway: 8.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'glacier-blue', 'firestorm-red'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'rear-cross-traffic-alert', 'driver-attention-monitor', 'forward-collision-warning', 'automatic-emergency-braking', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'massage-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', 'power-tailgate', 'air-suspension', 'sport-mode', 'launch-control', '4g-wifi-hotspot', 'navigation-system', 'ambient-lighting', 'rain-sensing-wipers', 'auto-dimming-mirror', 'power-folding-mirrors', 'power-adjustable-seats'],
          description: 'The BMW X5 xDrive40i M Package delivers the perfect combination of executive luxury, driving dynamics, and technology.',
          costs: { depreciation: 5500, insurance: 2800, fuel: 1400, service: 1100 },
        },
      ],
    },
    {
      modelName: '5 Series', modelSlug: '5-series', brandSlug: 'bmw', bodyType: 'Sedan',
      genName: 'G60 Generation', genSlug: '5-series-g60',
      variants: [
        {
          variantCode: 'BMW-530I-MSPORT-25', name: '530i M Sport', slug: 'bmw-530i-m-sport-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'rwd',
          seatingCapacity: 5, doors: 4,
          engine: { displacementCc: 1998, cylinders: 4, powerHp: 245, torqueNm: 400, aspiration: 'turbo' },
          priceAED: 280000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 250, acceleration0To100Kph: 6.2, lengthMm: 4996, widthMm: 1900, heightMm: 1515, wheelbaseMm: 2995, bootSpaceLitres: 520, fuelTankLitres: 65, kerbWeightKg: 1745, airbags: 8, fuelEconomyCombined: 6.8, fuelEconomyCity: 8.0, fuelEconomyHighway: 5.9 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'navy-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'parking-sensors', 'sport-mode', 'ambient-lighting', 'navigation-system', 'premium-sound-system'],
          description: 'The BMW 530i M Sport blends executive sedan refinement with M performance-inspired design.',
          costs: { depreciation: 3900, insurance: 2000, fuel: 1000, service: 1000 },
        },
      ],
    },
    {
      modelName: 'C-Class', modelSlug: 'c-class', brandSlug: 'mercedes-benz', bodyType: 'Sedan',
      genName: 'W206 Generation', genSlug: 'c-class-w206',
      variants: [
        {
          variantCode: 'C200-AMG-25', name: 'C200 AMG Line', slug: 'mercedes-c200-amg-line-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'rwd',
          seatingCapacity: 5, doors: 4,
          engine: { displacementCc: 1496, cylinders: 4, powerHp: 204, torqueNm: 300, aspiration: 'turbo' },
          priceAED: 229000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1605559424843-9073c6223bed?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 240, acceleration0To100Kph: 7.5, lengthMm: 4751, widthMm: 1820, heightMm: 1438, wheelbaseMm: 2865, bootSpaceLitres: 455, fuelTankLitres: 66, kerbWeightKg: 1555, airbags: 8, fuelEconomyCombined: 6.7, fuelEconomyCity: 8.1, fuelEconomyHighway: 5.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'firestorm-red', 'glacier-blue', 'graphite-grey'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'rear-cross-traffic-alert', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'parking-sensors', 'ambient-lighting', 'premium-sound-system', 'navigation-system', 'rain-sensing-wipers'],
          description: 'The Mercedes-Benz C200 AMG Line brings executive luxury and AMG-inspired sporty styling to the popular C-Class.',
          costs: { depreciation: 3200, insurance: 1600, fuel: 900, service: 900 },
        },
      ],
    },
    {
      modelName: 'GLE', modelSlug: 'gle', brandSlug: 'mercedes-benz', bodyType: 'SUV',
      genName: 'V167 Generation', genSlug: 'gle-v167',
      variants: [
        {
          variantCode: 'GLE450-AMG-25', name: 'GLE 450 AMG Line 4MATIC', slug: 'mercedes-gle450-amg-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'awd',
          seatingCapacity: 5, doors: 5,
          engine: { displacementCc: 2999, cylinders: 6, powerHp: 367, torqueNm: 500, aspiration: 'twin-turbo' },
          priceAED: 399000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 250, acceleration0To100Kph: 5.7, lengthMm: 4924, widthMm: 2019, heightMm: 1795, wheelbaseMm: 2995, bootSpaceLitres: 825, fuelTankLitres: 85, kerbWeightKg: 2130, airbags: 9, fuelEconomyCombined: 9.1, fuelEconomyCity: 11.0, fuelEconomyHighway: 7.9 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'glacier-blue', 'champagne-gold'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'night-vision', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'massage-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', 'power-tailgate', 'air-suspension', 'sport-mode', 'ambient-lighting', 'premium-sound-system', 'navigation-system'],
          description: 'The Mercedes-Benz GLE 450 AMG Line combines a powerful inline-6 engine with luxurious comfort and cutting-edge technology.',
          costs: { depreciation: 5200, insurance: 2600, fuel: 1350, service: 1100 },
        },
      ],
    },
    {
      modelName: 'Model Y', modelSlug: 'model-y', brandSlug: 'tesla', bodyType: 'SUV',
      genName: 'Model Y Refresh', genSlug: 'model-y-2024',
      variants: [
        {
          variantCode: 'MY-LR-AWD-25', name: 'Long Range AWD', slug: 'tesla-model-y-long-range-2025',
          modelYear: 2025, fuelType: 'electric', transmissionType: 'automatic', drivetrain: 'awd',
          seatingCapacity: 5, doors: 5,
          engine: { displacementCc: 0, cylinders: 0, powerHp: 449, torqueNm: 693 },
          priceAED: 195000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 217, acceleration0To100Kph: 5.0, lengthMm: 4751, widthMm: 1921, heightMm: 1624, wheelbaseMm: 2890, bootSpaceLitres: 854, fuelTankLitres: 0, kerbWeightKg: 2003, airbags: 8, fuelEconomyCombined: 0, fuelEconomyCity: 0, fuelEconomyHighway: 0 },
          colorSlugs: ['lunar-white', 'midnight-black', 'titanium-silver', 'glacier-blue', 'firestorm-red'],
          featureSlugs: ['adaptive-cruise-control', 'lane-keeping-assist', 'automatic-emergency-braking', 'forward-collision-warning', 'blind-spot-monitoring', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'apple-carplay', 'wireless-charging', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', '360-degree-camera', 'digital-instrument-cluster', 'navigation-system', '4g-wifi-hotspot', 'power-tailgate', 'launch-control'],
          description: 'The Tesla Model Y Long Range AWD delivers over 500km range with instant electric torque, autopilot, and industry-leading technology.',
          costs: { depreciation: 2600, insurance: 1500, fuel: 400, service: 200 },
        },
      ],
    },
    {
      modelName: 'Tucson', modelSlug: 'tucson', brandSlug: 'hyundai', bodyType: 'SUV',
      genName: 'NX4 Generation', genSlug: 'tucson-nx4',
      variants: [
        {
          variantCode: 'TUCSON-20-PREM-25', name: '2.0L GDI Premium', slug: 'hyundai-tucson-2-0-gdi-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'awd',
          seatingCapacity: 5, doors: 5,
          engine: { displacementCc: 1999, cylinders: 4, powerHp: 156, torqueNm: 192 },
          priceAED: 115000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 190, acceleration0To100Kph: 9.7, lengthMm: 4630, widthMm: 1865, heightMm: 1665, wheelbaseMm: 2755, bootSpaceLitres: 620, fuelTankLitres: 54, kerbWeightKg: 1605, airbags: 6, fuelEconomyCombined: 8.5, fuelEconomyCity: 10.0, fuelEconomyHighway: 7.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'firestorm-red', 'glacier-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-departure-warning', 'forward-collision-warning', 'dual-zone-climate-control', 'panoramic-sunroof', 'heated-front-seats', 'ventilated-front-seats', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', '360-degree-camera', 'led-headlights', 'digital-instrument-cluster', 'power-tailgate', 'rain-sensing-wipers'],
          description: 'The Hyundai Tucson 2.0L GDI Premium blends bold design, smart features, and AWD capability at outstanding value.',
          costs: { depreciation: 1600, insurance: 850, fuel: 1100, service: 450 },
        },
      ],
    },
    {
      modelName: 'Creta', modelSlug: 'creta', brandSlug: 'hyundai', bodyType: 'SUV',
      genName: 'SU2 Generation', genSlug: 'creta-su2',
      variants: [
        {
          variantCode: 'CRETA-15-SMART-25', name: '1.5L Smart', slug: 'hyundai-creta-1-5-smart-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'fwd',
          seatingCapacity: 5, doors: 5,
          engine: { displacementCc: 1497, cylinders: 4, powerHp: 115, torqueNm: 144 },
          priceAED: 79000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 170, acceleration0To100Kph: 12.5, lengthMm: 4300, widthMm: 1790, heightMm: 1635, wheelbaseMm: 2610, bootSpaceLitres: 433, fuelTankLitres: 50, kerbWeightKg: 1350, airbags: 6, fuelEconomyCombined: 7.0, fuelEconomyCity: 8.2, fuelEconomyHighway: 6.2 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'firestorm-red', 'glacier-blue', 'graphite-grey'],
          featureSlugs: ['lane-departure-warning', 'forward-collision-warning', 'apple-carplay', 'android-auto', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'rain-sensing-wipers'],
          description: 'The Hyundai Creta Smart offers compelling value with modern features in a compact urban SUV package.',
          costs: { depreciation: 1100, insurance: 650, fuel: 800, service: 350 },
        },
      ],
    },
    {
      modelName: 'Sportage', modelSlug: 'sportage', brandSlug: 'kia', bodyType: 'SUV',
      genName: 'NQ5 Generation', genSlug: 'sportage-nq5',
      variants: [
        {
          variantCode: 'SPORTAGE-20-EX-25', name: '2.0L EX AWD', slug: 'kia-sportage-2-0-ex-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'awd',
          seatingCapacity: 5, doors: 5,
          engine: { displacementCc: 1999, cylinders: 4, powerHp: 149, torqueNm: 179 },
          priceAED: 99000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 185, acceleration0To100Kph: 10.3, lengthMm: 4515, widthMm: 1865, heightMm: 1670, wheelbaseMm: 2680, bootSpaceLitres: 543, fuelTankLitres: 52, kerbWeightKg: 1500, airbags: 6, fuelEconomyCombined: 8.3, fuelEconomyCity: 9.5, fuelEconomyHighway: 7.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'forest-green', 'firestorm-red'],
          featureSlugs: ['adaptive-cruise-control', 'lane-departure-warning', 'blind-spot-monitoring', 'dual-zone-climate-control', 'panoramic-sunroof', 'heated-front-seats', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start', 'parking-sensors', 'led-headlights', 'digital-instrument-cluster', 'power-tailgate'],
          description: 'The Kia Sportage 2.0L EX AWD delivers generous equipment levels and rugged all-wheel drive at a sensible price.',
          costs: { depreciation: 1400, insurance: 780, fuel: 1050, service: 420 },
        },
      ],
    },
    {
      modelName: 'Q8', modelSlug: 'q8', brandSlug: 'audi', bodyType: 'SUV',
      genName: 'F1 Generation', genSlug: 'q8-f1',
      variants: [
        {
          variantCode: 'Q8-55TFSI-25', name: 'Q8 55 TFSI quattro', slug: 'audi-q8-55-tfsi-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'awd',
          seatingCapacity: 5, doors: 5,
          engine: { displacementCc: 2995, cylinders: 6, powerHp: 340, torqueNm: 500, aspiration: 'twin-turbo' },
          priceAED: 389000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1617654112368-307921291f42?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 246, acceleration0To100Kph: 5.9, lengthMm: 4986, widthMm: 1995, heightMm: 1705, wheelbaseMm: 2995, bootSpaceLitres: 605, fuelTankLitres: 85, kerbWeightKg: 2220, airbags: 8, fuelEconomyCombined: 9.5, fuelEconomyCity: 11.5, fuelEconomyHighway: 8.2 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'glacier-blue', 'graphite-grey', 'champagne-gold'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'rear-cross-traffic-alert', 'night-vision', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'massage-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', 'power-tailgate', 'air-suspension', 'sport-mode', 'ambient-lighting', 'premium-sound-system', 'navigation-system', '4g-wifi-hotspot', 'launch-control'],
          description: 'The Audi Q8 55 TFSI quattro combines fastback coupe styling with flagship SUV performance and technology.',
          costs: { depreciation: 5300, insurance: 2700, fuel: 1400, service: 1100 },
        },
      ],
    },
    {
      modelName: 'ES', modelSlug: 'es', brandSlug: 'lexus', bodyType: 'Sedan',
      genName: 'ES7 Series', genSlug: 'es-seventh-gen',
      variants: [
        {
          variantCode: 'ES350-PREST-25', name: 'ES 350 Prestige', slug: 'lexus-es-350-prestige-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'fwd',
          seatingCapacity: 5, doors: 4,
          engine: { displacementCc: 3456, cylinders: 6, powerHp: 302, torqueNm: 361 },
          priceAED: 235000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 210, acceleration0To100Kph: 6.6, lengthMm: 4975, widthMm: 1865, heightMm: 1445, wheelbaseMm: 2870, bootSpaceLitres: 450, fuelTankLitres: 70, kerbWeightKg: 1730, airbags: 10, fuelEconomyCombined: 9.8, fuelEconomyCity: 11.5, fuelEconomyHighway: 8.5 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'deep-burgundy', 'navy-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'rear-cross-traffic-alert', 'driver-attention-monitor', 'automatic-emergency-braking', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'memory-seats', 'massage-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', 'ambient-lighting', 'premium-sound-system', 'navigation-system', 'rain-sensing-wipers', 'auto-dimming-mirror', 'power-folding-mirrors'],
          description: 'The Lexus ES 350 Prestige delivers legendary Japanese craftsmanship, ultra-quiet cabin refinement, and executive sedan luxury.',
          costs: { depreciation: 3300, insurance: 1700, fuel: 1250, service: 600 },
        },
      ],
    },
    {
      modelName: 'Cayenne', modelSlug: 'cayenne', brandSlug: 'porsche', bodyType: 'SUV',
      genName: 'E3 Facelift', genSlug: 'cayenne-e3',
      variants: [
        {
          variantCode: 'CAYENNE-30-25', name: 'Cayenne 3.0T V6', slug: 'porsche-cayenne-3-0t-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'awd',
          seatingCapacity: 5, doors: 5,
          engine: { displacementCc: 2894, cylinders: 6, powerHp: 348, torqueNm: 500, aspiration: 'twin-turbo' },
          priceAED: 485000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 253, acceleration0To100Kph: 5.9, lengthMm: 4918, widthMm: 1983, heightMm: 1696, wheelbaseMm: 2895, bootSpaceLitres: 771, fuelTankLitres: 90, kerbWeightKg: 2170, airbags: 8, fuelEconomyCombined: 9.4, fuelEconomyCity: 11.2, fuelEconomyHighway: 8.0 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'forest-green', 'glacier-blue'],
          featureSlugs: ['adaptive-cruise-control', 'blind-spot-monitoring', 'lane-keeping-assist', 'automatic-emergency-braking', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'memory-seats', 'massage-seats', '360-degree-camera', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'parking-sensors', 'power-tailgate', 'air-suspension', 'sport-mode', 'launch-control', 'ambient-lighting', 'premium-sound-system', 'navigation-system'],
          description: 'The Porsche Cayenne 3.0T combines Porsche sports DNA with SUV practicality for the definitive driver SUV.',
          costs: { depreciation: 6500, insurance: 3400, fuel: 1450, service: 1500 },
        },
      ],
    },
    {
      modelName: 'Defender', modelSlug: 'defender', brandSlug: 'land-rover', bodyType: 'SUV',
      genName: 'L663 Generation', genSlug: 'defender-l663',
      variants: [
        {
          variantCode: 'DEF-110-SE-P400-25', name: 'Defender 110 SE P400', slug: 'land-rover-defender-110-se-p400-2025',
          modelYear: 2025, fuelType: 'petrol', transmissionType: 'automatic', drivetrain: 'awd',
          seatingCapacity: 5, doors: 5,
          engine: { displacementCc: 2996, cylinders: 6, powerHp: 400, torqueNm: 550, aspiration: 'twin-turbo' },
          priceAED: 499000, availabilityStatus: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?auto=format&fit=crop&w=1200&q=80',
          specs: { topSpeedKph: 209, acceleration0To100Kph: 5.4, lengthMm: 5018, widthMm: 2008, heightMm: 1966, wheelbaseMm: 3022, bootSpaceLitres: 786, fuelTankLitres: 90, kerbWeightKg: 2380, airbags: 7, fuelEconomyCombined: 11.2, fuelEconomyCity: 13.0, fuelEconomyHighway: 9.8 },
          colorSlugs: ['pearl-white', 'midnight-black', 'titanium-silver', 'graphite-grey', 'forest-green', 'desert-sand'],
          featureSlugs: ['adaptive-cruise-control', 'terrain-management', 'air-suspension', 'panoramic-sunroof', 'ventilated-front-seats', 'heated-front-seats', 'heated-rear-seats', 'memory-seats', '360-degree-camera', 'apple-carplay', 'android-auto', 'head-up-display', 'wireless-charging', 'digital-instrument-cluster', 'matrix-led-headlights', 'keyless-entry', 'push-button-start', 'remote-start', 'parking-sensors', 'power-tailgate', 'roof-rails', 'running-boards', 'night-vision'],
          description: 'The Land Rover Defender 110 SE P400 combines legendary off-road capability with modern luxury and 400hp performance.',
          costs: { depreciation: 6800, insurance: 3200, fuel: 1600, service: 1400 },
        },
      ],
    },
  ];

  const allVariants: { variant: any; brand: any; model: any }[] = [];

  for (const vehicleData of vehiclesToSeed) {
    const brand = brandMap[vehicleData.brandSlug];
    if (!brand) { console.warn(`Brand not found: ${vehicleData.brandSlug}`); continue; }

    const vehicleModel: any = await VehicleModel.create({
      brandId: brand._id,
      modelCode: vehicleData.modelSlug.toUpperCase().replace(/-/g, '_'),
      name: vehicleData.modelName,
      slug: vehicleData.modelSlug,
      bodyType: vehicleData.bodyType,
      status: 'active',
    });

    const generation: any = await Generation.create({
      modelId: vehicleModel._id,
      generationCode: vehicleData.genSlug.toUpperCase().replace(/-/g, '_'),
      name: vehicleData.genName,
      slug: vehicleData.genSlug,
      status: 'active',
    });

    for (const vd of vehicleData.variants) {
      const variant: any = await Variant.create({
        generationId: generation._id,
        variantCode: vd.variantCode,
        name: vd.name,
        slug: vd.slug,
        description: vd.description,
        shortDescription: vd.description.substring(0, 100),
        modelYear: vd.modelYear,
        fuelType: vd.fuelType as any,
        transmissionType: vd.transmissionType as any,
        drivetrain: vd.drivetrain as any,
        seatingCapacity: vd.seatingCapacity,
        doors: vd.doors,
        engine: vd.engine,
        status: 'active',
      } as any);

      await Specification.create({
        variantId: variant._id,
        performance: { topSpeedKph: vd.specs.topSpeedKph, acceleration0To100Kph: vd.specs.acceleration0To100Kph },
        dimensions: { lengthMm: vd.specs.lengthMm, widthMm: vd.specs.widthMm, heightMm: vd.specs.heightMm, wheelbaseMm: vd.specs.wheelbaseMm },
        capacity: { bootSpaceLitres: vd.specs.bootSpaceLitres, fuelTankLitres: vd.specs.fuelTankLitres },
        weight: { kerbWeightKg: vd.specs.kerbWeightKg },
        fuel: { fuelEconomyCombined: vd.specs.fuelEconomyCombined, fuelEconomyCity: vd.specs.fuelEconomyCity, fuelEconomyHighway: vd.specs.fuelEconomyHighway, economyUnit: 'L/100km' },
        safety: { airbags: vd.specs.airbags, abs: true, tractionControl: true, stabilityControl: true },
        status: 'active',
      });

      // Variant market uses nested pricing object
      await VariantMarket.create({
        variantId: variant._id,
        marketId: marketUAE._id,
        availabilityStatus: vd.availabilityStatus,
        status: 'active',
        isFeatured: vd.availabilityStatus === 'available' && vd.priceAED > 200000,
        pricing: { amount: vd.priceAED, currencyCode: 'AED', priceType: 'starting' },
      });

      // Media - use entityId/entityType pattern
      await Media.create({
        entityType: 'variant',
        entityId: variant._id,
        mediaType: 'image',
        storageProvider: 'local',
        storageKey: `external/${vd.slug}-main`,
        url: vd.imageUrl,
        originalName: `${vd.slug}-main.jpg`,
        mimeType: 'image/jpeg',
        size: 250000,
        isPrimary: true,
        altText: `${vehicleData.modelName} ${vd.name}`,
        status: 'active',
      });

      // CostToOwn - use actual schema fields
      await CostToOwn.create({
        variantId: variant._id,
        marketId: marketUAE._id,
        fuelCostAssumptions: vd.costs.fuel,
        insurance: vd.costs.insurance,
        maintenance: vd.costs.service,
        service: vd.costs.service,
        depreciation: vd.costs.depreciation,
        otherOwnershipCosts: 800,
        ownershipPeriod: 36,
        totalEstimatedCost: (vd.costs.depreciation + vd.costs.insurance + vd.costs.fuel + vd.costs.service + 800) * 36,
        status: 'active',
      });

      // VariantColors
      for (const colorSlug of vd.colorSlugs) {
        const color = colorMap[colorSlug];
        if (color) {
          try {
            await VariantColor.create({
              variantId: variant._id,
              colorId: color._id,
              availability: 'standard',
              status: 'active',
            });
          } catch (_) { /* skip duplicates */ }
        }
      }

      // VariantFeatures
      for (const featureSlug of vd.featureSlugs) {
        const feature = featureMap[featureSlug];
        if (feature) {
          try {
            await VariantFeature.create({
              variantId: variant._id,
              featureId: feature._id,
              availability: 'standard',
              status: 'active',
            });
          } catch (_) { /* skip duplicates */ }
        }
      }

      allVariants.push({ variant, brand, model: vehicleModel });
    }
  }

  console.log(`  ${allVariants.length} vehicle variants seeded`);

  // ===================== 6. REVIEWS =====================
  console.log('Seeding Reviews...');
  const reviewsRaw = [
    { idx: 0, rating: 5, title: 'Land Cruiser — still the king of UAE SUVs', body: 'Owned the GXR V6 for 6 months. Incredible twin-turbo performance, superb off-road capability in the dunes, and 7-seat comfort is top-notch. The GCC cooling package handles Dubai summers effortlessly.' },
    { idx: 3, rating: 5, title: 'Patrol LE Platinum — royalty on wheels', body: 'The V8 rumble at startup is addictive. Interior is flagship quality. Massaging seats, 360 camera, tri-zone climate. Visibility over traffic is commanding. Resale value is phenomenal.' },
    { idx: 0, rating: 4, title: 'GXR V6 after a Ramadan road trip', body: 'Abu Dhabi to Muscat with full family. Comfort throughout, V6 pulls strong on highways. Fuel consumption was expected from a large V6 SUV.' },
    { idx: 9, rating: 5, title: 'Tesla Model Y — the future is here', body: 'Autopilot on Sheikh Zayed Road is magical. Over 500km range in real-world UAE driving. DEWA charging network is solid in Dubai. Worth every dirham.' },
    { idx: 5, rating: 5, title: 'BMW X5 M Package — sport SUV perfection', body: 'M Sport handling without the M price. Acceleration is brutal, 12.3-inch screen is stunning. Best SUV I have owned in the UAE.' },
    { idx: 7, rating: 4, title: 'Mercedes C200 AMG — understated excellence', body: 'The MBUX system is brilliantly intuitive. Rear seat comfort is outstanding. Only downside is the maintenance cost from Dubai dealers, but resale holds strong.' },
    { idx: 13, rating: 5, title: 'Audi Q8 — technology showcase', body: 'Three touchscreens, Quattro grip on wet roads, and panoramic roof makes it feel open. Premium segment competitor to the best Germans.' },
    { idx: 10, rating: 4, title: 'Hyundai Tucson — best value for money SUV', body: 'Premium features at half European rival prices. Panoramic roof, ventilated seats, 360 camera all at AED 115k. Perfect family car.' },
    { idx: 2, rating: 5, title: 'Camry Grande V6 — executive sedan under AED 150k', body: 'Silky smooth V6, incredibly quiet cabin, generous feature set. Better value than European executive sedans at similar price points.' },
    { idx: 14, rating: 5, title: 'Lexus ES 350 — Japanese luxury benchmark', body: 'Nothing beats Lexus build quality and reliability. Library-quiet cabin. Mark Levinson sound is extraordinary. Lowest maintenance cost of any luxury brand.' },
    { idx: 11, rating: 4, title: 'Kia Sportage — best budget AWD in UAE', body: 'Impressive feature list for AED 99k. Panoramic roof, heated seats, and AWD traction. Dashboard design is attractive and modern.' },
    { idx: 4, rating: 5, title: 'Nissan X-Terra PRO-4X — dune conqueror', body: 'Fossil Rock and Big Red in Sharjah handled with ease. Terrain Management nailed everything. Solid built, raw and rugged feel. Exactly what a proper 4x4 should be.' },
    { idx: 15, rating: 4, title: 'Porsche Cayenne — sports car in an SUV body', body: 'Fastest SUV lap I have done at Dubai Autodrome. Steering feedback unlike any other. Air suspension transforms from sporty to comfortable. Stunning machine.' },
    { idx: 16, rating: 5, title: 'Land Rover Defender 110 — unlike anything else', body: 'Dubai to Hatta mountain trails. The Defender laughed at terrain that damages regular SUVs. P400 engine is brutally powerful. Head turning everywhere.' },
  ];

  let reviewsSeeded = 0;
  for (const rd of reviewsRaw) {
    const targetVariant = allVariants[Math.min(rd.idx, allVariants.length - 1)];
    try {
      await Review.create({
        variantId: targetVariant.variant._id,
        userId: adminUser!._id,
        rating: rd.rating,
        title: rd.title,
        body: rd.body,
        status: 'approved',
      });
      reviewsSeeded++;
    } catch (_) { /* skip duplicate userId+variantId if same user reviewed same car */ }
  }
  console.log(`  ${reviewsSeeded} reviews seeded`);

  // ===================== 7. ARTICLES =====================
  console.log('Seeding Articles...');
  const articlesRaw = [
    { title: 'Best 7-Seater SUVs for Family Use in UAE 2025', slug: 'best-7-seater-suvs-family-use-uae-2025', excerpt: 'What to look for beyond price — running cost, GCC spec, and practicality for Gulf families.', content: 'Choosing a 7-seater SUV in the UAE requires balancing summer heat resistance, third-row practicality, running costs, and resale value. In this guide, we compare the Toyota Land Cruiser GXR V6, Nissan Patrol LE Platinum, Toyota Prado TXL, and Land Rover Defender 110. The Land Cruiser leads for reliability and resale, while the Patrol V8 wins on space and ride comfort. The Prado offers a modern turbocharged compromise, and the Defender is the lifestyle choice. All carry strong GCC specifications with enhanced cooling systems for UAE summers.', category: 'buying-guide' },
    { title: 'Tesla vs Hybrid in UAE: Which is Cheaper to Own in 2025?', slug: 'tesla-vs-hybrid-uae-total-cost-comparison', excerpt: 'We break down the real 3-year ownership cost of the Tesla Model Y versus Toyota Camry Hybrid.', content: 'Electric vehicles are gaining ground in the UAE thanks to lower fuel costs, zero road tax, and expanding DEWA Green Charger infrastructure. The Tesla Model Y Long Range costs AED 195,000 upfront versus AED 125,000 for the Toyota Camry Hybrid XLE. However, annual running costs tell a different story: electricity costs approximately AED 400/month versus AED 580/month for hybrid fuel, and Tesla servicing is negligible. Over 3 years, the total cost gap narrows significantly. For high mileage drivers above 25,000 km per year, the Tesla wins convincingly.', category: 'ev' },
    { title: 'UAE Car Insurance Guide 2025: How to Save AED 5,000 or More', slug: 'uae-car-insurance-guide-2025', excerpt: 'Comprehensive car insurance does not have to break the bank. Here is how to compare and save.', content: 'In the UAE, comprehensive car insurance typically costs 2.5% to 4% of vehicle value annually. For a AED 300,000 SUV, that is AED 7,500 to AED 12,000 per year. However, loyalty discounts, no-claims bonuses of up to 30% off, and comparison tools can dramatically reduce this. Key factors insurers evaluate include driver age, vehicle category, registered emirate, and annual mileage. Using a broker instead of direct insurer often saves AED 2,000 to AED 5,000 on comparable coverage.', category: 'buying-guide' },
    { title: 'Hidden Costs of Car Ownership in Dubai You Must Know', slug: 'hidden-costs-car-ownership-dubai', excerpt: 'Registration fees, Salik, parking, and depreciation — the real cost of owning a car in Dubai.', content: 'The sticker price is just the beginning. Dubai car owners must budget for Salik toll fees averaging AED 600 per month for daily commuters, vehicle registration renewal at AED 350-500, mandatory RTA testing, parking fees, and the largest hidden cost which is depreciation. A AED 200,000 SUV loses 15-20% of its value in year 1 alone, amounting to AED 30,000-40,000 in the first 12 months. Understanding these costs is essential before purchasing any vehicle.', category: 'news' },
    { title: 'Top 5 Luxury SUVs Under AED 400,000 in UAE', slug: 'top-5-luxury-suvs-under-400k-uae', excerpt: 'Premium SUV segment analysis for UAE buyers with AED 350K-400K budget in 2025.', content: 'The AED 350,000-400,000 segment in the UAE offers remarkable choice: BMW X5 xDrive40i M Package at AED 398,000, Audi Q8 55 TFSI at AED 389,000, Nissan Patrol LE Platinum at AED 340,000, Mercedes-Benz GLE 450 at AED 399,000, and Toyota Land Cruiser GXR V6 at AED 335,000. The Land Cruiser leads in resale and reliability. The Patrol V8 wins on space and presence. The BMW X5 wins on driving dynamics. The Audi Q8 wins on technology. Your choice depends on your priorities.', category: 'buying-guide' },
    { title: 'GCC vs Non-GCC Spec Cars: What You Need to Know', slug: 'gcc-vs-non-gcc-spec-cars-uae', excerpt: 'Should you buy a GCC spec or grey market import? The complete guide for UAE buyers.', content: 'GCC specification vehicles are engineered for the region with enhanced cooling systems, reinforced seals against desert dust, and compliance with UAE RTA standards. Non-GCC imports are typically cheaper by 10-20% but come with significant risks: no dealer warranty, potential import duty complications, parts availability issues, and resale value significantly lower than GCC equivalents. In the UAE, banks also refuse financing for non-GCC vehicles. Our recommendation: always buy GCC spec in the UAE market.', category: 'news' },
    { title: 'EV Charging Infrastructure in UAE: State of the Network 2025', slug: 'ev-charging-infrastructure-uae-2025', excerpt: 'DEWA Green Charger, Tesla Superchargers, and third-party networks mapped and compared.', content: 'The UAE electric vehicle charging infrastructure has expanded rapidly. DEWA Green Charger network now covers 700 plus public charging points across Dubai alone, with free AC charging until 2027. Tesla has 12 Supercharger stations across Dubai, Abu Dhabi, and Sharjah with 150kW plus speeds. ADDC, Charge and Go, and private operators add hundreds more points in residential and commercial properties. For Tesla Model Y owners, a full charge costs approximately AED 35 at a Supercharger versus AED 200 plus for an equivalent petrol fill.', category: 'ev' },
    { title: 'Best Cars for Dubai Summer Heat: What Really Matters in a GCC SUV', slug: 'best-cars-dubai-summer-heat-gcc', excerpt: 'Key factors that separate genuine GCC-spec vehicles from average ones when temperatures hit 48 degrees C.', content: 'Summers in the UAE push ambient temperatures above 48 degrees C, creating unique demands on vehicles. Key GCC-specific engineering includes enhanced radiator capacity, double-insulated wiring, reinforced AC compressors, specialized coolant formulations, UV-resistant interior materials, and multi-layer windshield glass. Vehicles like the Toyota Land Cruiser, Nissan Patrol, and Lexus ES have decades of GCC-specific development. Tesla Model Y has adapted its battery thermal management specifically for Gulf climate. When evaluating any vehicle, asking for proof of GCC specification documentation from the dealer is essential.', category: 'buying-guide' },
  ];

  for (const ad of articlesRaw) {
    try {
      await Article.create({
        title: ad.title,
        slug: ad.slug,
        excerpt: ad.excerpt,
        content: ad.content,
        category: ad.category,
        authorId: adminUser!._id,
        status: 'published',
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 120 * 24 * 60 * 60 * 1000)),
      });
    } catch (_) { /* skip duplicates */ }
  }
  console.log(`  ${articlesRaw.length} articles seeded`);

  console.log('\n====================================================');
  console.log('   SEED COMPLETE');
  console.log('====================================================');
  console.log(`  Brands: ${brands.length}`);
  console.log(`  Variants: ${allVariants.length}`);
  console.log(`  Colors: ${allColors.length} (${exteriorColors.length} exterior, ${interiorColors.length} interior)`);
  console.log(`  Features: ${features.length}`);
  console.log(`  Reviews: ${reviewsSeeded}`);
  console.log(`  Articles: ${articlesRaw.length}`);
  console.log('====================================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
