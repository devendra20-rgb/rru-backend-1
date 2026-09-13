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
import { Review } from '../modules/reviews/review.model';
import { Article } from '../modules/articles/article.model';
import { User } from '../modules/users/user.model';
import { Color, VariantColor } from '../modules/catalog/colors/color.model';
import { Feature, VariantFeature } from '../modules/catalog/features/feature.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/rideroundup?retryWrites=true&w=majority';

async function restoreFullCatalog() {
  console.log('Connecting to MongoDB database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to:', mongoose.connection.name);

  // Safe catalog restoration
  console.log('Restoring catalog safely (non-destructive)...');

  // ===================== 1. COLORS =====================
  console.log('1. Restoring Colors...');
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
    { name: 'Nardo Grey', slug: 'nardo-grey', hexCode: '#686B73', type: 'exterior' },
    { name: 'Miami Blue', slug: 'miami-blue', hexCode: '#0085CA', type: 'exterior' },
    { name: 'Racing Yellow', slug: 'racing-yellow', hexCode: '#F7D000', type: 'exterior' },
    { name: 'British Racing Green', slug: 'british-racing-green', hexCode: '#004225', type: 'exterior' },
    { name: 'Rosso Corsa', slug: 'rosso-corsa', hexCode: '#D40000', type: 'exterior' },
  ]);

  const interiorColors = await Color.insertMany([
    { name: 'Black Leather', slug: 'black-leather', hexCode: '#1A1A1A', type: 'interior' },
    { name: 'Beige Caramel', slug: 'beige-caramel', hexCode: '#C8A97E', type: 'interior' },
    { name: 'Dark Brown', slug: 'dark-brown', hexCode: '#4A2C17', type: 'interior' },
    { name: 'Red Sport Leather', slug: 'red-sport-leather', hexCode: '#8B1A1A', type: 'interior' },
    { name: 'Ivory White', slug: 'ivory-white', hexCode: '#F8F4E8', type: 'interior' },
    { name: 'Graphite Fabric', slug: 'graphite-fabric', hexCode: '#3D3D3D', type: 'interior' },
    { name: 'Tan Windsor Leather', slug: 'tan-windsor-leather', hexCode: '#A0522D', type: 'interior' },
    { name: 'Alcantara Anthracite', slug: 'alcantara-anthracite', hexCode: '#2B2B2B', type: 'interior' },
  ]);

  const allColors = [...exteriorColors, ...interiorColors];
  const colorMap: Record<string, any> = {};
  allColors.forEach(c => { colorMap[c.slug] = c; });
  console.log(`  ✓ ${allColors.length} colors restored`);

  // ===================== 2. FEATURES =====================
  console.log('2. Restoring Features...');
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
    { name: 'Quad-Zone Climate Control', slug: 'quad-zone-climate-control', category: 'comfort', description: 'Individual temperature zones for each seat' },
    // Infotainment
    { name: 'Apple CarPlay', slug: 'apple-carplay', category: 'infotainment', description: 'Wireless Apple CarPlay integration' },
    { name: 'Android Auto', slug: 'android-auto', category: 'infotainment', description: 'Wireless Android Auto integration' },
    { name: 'Premium Sound System', slug: 'premium-sound-system', category: 'infotainment', description: 'High-end branded audio system (Burmester/Bowers & Wilkins/Bose/JBL)' },
    { name: '4G Wi-Fi Hotspot', slug: '4g-wifi-hotspot', category: 'infotainment', description: 'Built-in 4G LTE internet hotspot' },
    { name: 'Head-Up Display', slug: 'head-up-display', category: 'infotainment', description: 'Speed and navigation projected onto windshield' },
    { name: 'Digital Instrument Cluster', slug: 'digital-instrument-cluster', category: 'infotainment', description: 'Fully digital configurable gauge cluster' },
    { name: 'Wireless Charging', slug: 'wireless-charging', category: 'infotainment', description: 'Qi wireless charging pad' },
    { name: 'Navigation System', slug: 'navigation-system', category: 'infotainment', description: 'Built-in GPS navigation with live traffic' },
    { name: 'Rear Seat Entertainment', slug: 'rear-seat-entertainment', category: 'infotainment', description: 'Twin HD displays for rear passengers' },
    // Exterior
    { name: 'LED Headlights', slug: 'led-headlights', category: 'exterior', description: 'Full LED adaptive headlights' },
    { name: 'Matrix LED Headlights', slug: 'matrix-led-headlights', category: 'exterior', description: 'Intelligent pixel LED headlights with glare elimination' },
    { name: 'Laser Headlights', slug: 'laser-headlights', category: 'exterior', description: 'High-beam laser lighting with 600m range' },
    { name: 'Power Tailgate', slug: 'power-tailgate', category: 'exterior', description: 'Hands-free or button-operated rear door' },
    { name: 'Roof Rails', slug: 'roof-rails', category: 'exterior', description: 'Integrated roof rails for cargo accessories' },
    { name: 'Running Boards', slug: 'running-boards', category: 'exterior', description: 'Side step boards for easy entry and exit' },
    { name: 'Soft-Close Doors', slug: 'soft-close-doors', category: 'exterior', description: 'Automatic power-latching doors' },
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
    { name: 'Carbon Ceramic Brakes', slug: 'carbon-ceramic-brakes', category: 'performance', description: 'High-performance fade-free braking system' },
    { name: 'Active Exhaust System', slug: 'active-exhaust-system', category: 'performance', description: 'Variable valved exhaust with louder sport mode' },
  ];

  const features = await Feature.insertMany(featuresData as any[]);
  const featureMap: Record<string, any> = {};
  features.forEach(f => { featureMap[f.slug] = f; });
  console.log(`  ✓ ${features.length} features restored`);

  // ===================== 3. MARKETS =====================
  console.log('3. Restoring Market (UAE)...');
  const marketUAE = await Market.create({
    code: 'UAE',
    name: 'United Arab Emirates',
    countryCode: 'AE',
    currencyCode: 'AED',
    status: 'active',
  });

  // ===================== 4. 35+ BRANDS =====================
  console.log('4. Restoring 35+ Brands with Official Logos...');
  const brandsData = [
    { brandCode: 'TOYOTA', name: 'Toyota', slug: 'toyota', originCountryCode: 'JP', status: 'active', websiteUrl: 'https://www.toyota.ae' },
    { brandCode: 'NISSAN', name: 'Nissan', slug: 'nissan', originCountryCode: 'JP', status: 'active', websiteUrl: 'https://www.nissan-me.com' },
    { brandCode: 'BMW', name: 'BMW', slug: 'bmw', originCountryCode: 'DE', status: 'active', websiteUrl: 'https://www.bmw-dubai.com' },
    { brandCode: 'MERCEDES', name: 'Mercedes-Benz', slug: 'mercedes-benz', originCountryCode: 'DE', status: 'active', websiteUrl: 'https://www.mercedes-benz-mena.com' },
    { brandCode: 'HYUNDAI', name: 'Hyundai', slug: 'hyundai', originCountryCode: 'KR', status: 'active', websiteUrl: 'https://www.hyundai.com/me' },
    { brandCode: 'KIA', name: 'Kia', slug: 'kia', originCountryCode: 'KR', status: 'active', websiteUrl: 'https://www.kia.com/ae' },
    { brandCode: 'AUDI', name: 'Audi', slug: 'audi', originCountryCode: 'DE', status: 'active', websiteUrl: 'https://www.audi-dubai.com' },
    { brandCode: 'LEXUS', name: 'Lexus', slug: 'lexus', originCountryCode: 'JP', status: 'active', websiteUrl: 'https://www.lexus.ae' },
    { brandCode: 'TESLA', name: 'Tesla', slug: 'tesla', originCountryCode: 'US', status: 'active', websiteUrl: 'https://www.tesla.com/en_ae' },
    { brandCode: 'FORD', name: 'Ford', slug: 'ford', originCountryCode: 'US', status: 'active', websiteUrl: 'https://www.me.ford.com' },
    { brandCode: 'CHEVROLET', name: 'Chevrolet', slug: 'chevrolet', originCountryCode: 'US', status: 'active', websiteUrl: 'https://www.chevroletarabia.com' },
    { brandCode: 'HONDA', name: 'Honda', slug: 'honda', originCountryCode: 'JP', status: 'active', websiteUrl: 'https://www.honda.ae' },
    { brandCode: 'LANDROVER', name: 'Land Rover', slug: 'land-rover', originCountryCode: 'GB', status: 'active', websiteUrl: 'https://www.landrover-me.com' },
    { brandCode: 'PORSCHE', name: 'Porsche', slug: 'porsche', originCountryCode: 'DE', status: 'active', websiteUrl: 'https://www.porsche.com/middle-east' },
    { brandCode: 'VOLKSWAGEN', name: 'Volkswagen', slug: 'volkswagen', originCountryCode: 'DE', status: 'active', websiteUrl: 'https://www.volkswagen-me.com' },
    { brandCode: 'VOLVO', name: 'Volvo', slug: 'volvo', originCountryCode: 'SE', status: 'active', websiteUrl: 'https://www.volvocars.com/en-ae' },
    { brandCode: 'FERRARI', name: 'Ferrari', slug: 'ferrari', originCountryCode: 'IT', status: 'active', websiteUrl: 'https://www.ferrari.com' },
    { brandCode: 'LAMBORGHINI', name: 'Lamborghini', slug: 'lamborghini', originCountryCode: 'IT', status: 'active', websiteUrl: 'https://www.lamborghini.com' },
    { brandCode: 'ASTONMARTIN', name: 'Aston Martin', slug: 'aston-martin', originCountryCode: 'GB', status: 'active', websiteUrl: 'https://www.astonmartin.com' },
    { brandCode: 'BENTLEY', name: 'Bentley', slug: 'bentley', originCountryCode: 'GB', status: 'active', websiteUrl: 'https://www.bentleymotors.com' },
    { brandCode: 'ROLLSROYCE', name: 'Rolls-Royce', slug: 'rolls-royce', originCountryCode: 'GB', status: 'active', websiteUrl: 'https://www.rolls-roycemotorcars.com' },
    { brandCode: 'MASERATI', name: 'Maserati', slug: 'maserati', originCountryCode: 'IT', status: 'active', websiteUrl: 'https://www.maserati.com/middle-east' },
    { brandCode: 'MCLAREN', name: 'McLaren', slug: 'mclaren', originCountryCode: 'GB', status: 'active', websiteUrl: 'https://cars.mclaren.com' },
    { brandCode: 'JEEP', name: 'Jeep', slug: 'jeep', originCountryCode: 'US', status: 'active', websiteUrl: 'https://www.mideast.jeep.com' },
    { brandCode: 'DODGE', name: 'Dodge', slug: 'dodge', originCountryCode: 'US', status: 'active', websiteUrl: 'https://www.mideast.dodge.com' },
    { brandCode: 'RAM', name: 'RAM', slug: 'ram', originCountryCode: 'US', status: 'active', websiteUrl: 'https://www.mideast.ramtrucks.com' },
    { brandCode: 'GENESIS', name: 'Genesis', slug: 'genesis', originCountryCode: 'KR', status: 'active', websiteUrl: 'https://www.genesis.com/middleeast' },
    { brandCode: 'INFINITI', name: 'Infiniti', slug: 'infiniti', originCountryCode: 'JP', status: 'active', websiteUrl: 'https://www.infiniti-me.com' },
    { brandCode: 'JAGUAR', name: 'Jaguar', slug: 'jaguar', originCountryCode: 'GB', status: 'active', websiteUrl: 'https://www.jaguar-me.com' },
    { brandCode: 'MAZDA', name: 'Mazda', slug: 'mazda', originCountryCode: 'JP', status: 'active', websiteUrl: 'https://www.mazda-uae.com' },
    { brandCode: 'MITSUBISHI', name: 'Mitsubishi', slug: 'mitsubishi', originCountryCode: 'JP', status: 'active', websiteUrl: 'https://www.habtoormotors.com/mitsubishi' },
    { brandCode: 'SUBARU', name: 'Subaru', slug: 'subaru', originCountryCode: 'JP', status: 'active', websiteUrl: 'https://www.subaru-uae.com' },
    { brandCode: 'SUZUKI', name: 'Suzuki', slug: 'suzuki', originCountryCode: 'JP', status: 'active', websiteUrl: 'https://www.suzuki.ae' },
    { brandCode: 'MG', name: 'MG', slug: 'mg', originCountryCode: 'GB', status: 'active', websiteUrl: 'https://www.mg-me.com' },
    { brandCode: 'BYD', name: 'BYD', slug: 'byd', originCountryCode: 'CN', status: 'active', websiteUrl: 'https://www.byd.com/me' },
    { brandCode: 'GEELY', name: 'Geely', slug: 'geely', originCountryCode: 'CN', status: 'active', websiteUrl: 'https://www.geely.ae' },
    { brandCode: 'HAVAL', name: 'Haval', slug: 'haval', originCountryCode: 'CN', status: 'active', websiteUrl: 'https://www.haval-uae.com' },
    { brandCode: 'CHERY', name: 'Chery', slug: 'chery', originCountryCode: 'CN', status: 'active', websiteUrl: 'https://www.cheryuae.com' },
  ];

  const brands = await Brand.insertMany(brandsData);
  const brandMap: Record<string, any> = {};

  for (const b of brands) {
    brandMap[b.slug] = b;
    const mediaDoc = await Media.create({
      folder: 'brands',
      entityType: 'brand',
      entityId: b._id,
      mediaType: 'image',
      storageProvider: 'local',
      storageKey: `brands/${b.slug}-logo.png`,
      url: `https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/${b.slug}.png`,
      originalName: `${b.slug}-logo.png`,
      mimeType: 'image/png',
      size: 2048,
      status: 'active',
      isPrimary: true,
    });
    await Brand.updateOne({ _id: b._id }, { $set: { logoMediaId: mediaDoc._id } });
  }
  console.log(`  ✓ ${brands.length} brands restored with logoMediaId`);

  // ===================== 5. VEHICLE CATALOG =====================
  console.log('5. Restoring Vehicle Models, Generations, Variants, Specs, and Features...');

  interface VehicleSeed {
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

  const vehiclesToSeed: VehicleSeed[] = [
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
      ],
    },

    // 3. Nissan Patrol
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
      ],
    },

    // 4. BMW X5
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

    // 5. Mercedes-Benz G-Class
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

    // 6. Land Rover Defender 110
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
      ],
    },

    // 7. Porsche 911
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

    // 8. Tesla Model Y
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
      ],
    },

    // 9. Ford Mustang
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
          featureSlugs: ['launch-control', 'sport-mode', 'active-exhaust-system', 'digital-instrument-cluster', 'apple-carplay', 'android-auto', 'wireless-charging', 'keyless-entry', 'push-button-start', 'brembo-brakes' as any],
          description: 'The Ford Mustang Dark Horse unleashes track-ready American muscle with a naturally aspirated 500hp Coyote V8.',
          costs: { depreciation: 3800, insurance: 2100, fuel: 1900, service: 750 },
        },
      ],
    },

    // 10. Audi RS6 Avant
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
  ];

  let variantCount = 0;
  for (const vData of vehiclesToSeed) {
    const brand = brandMap[vData.brandSlug];
    if (!brand) {
      console.warn(`Brand ${vData.brandSlug} not found for model ${vData.modelName}`);
      continue;
    }

    // 1. Create Model
    const model = await VehicleModel.create({
      brandId: brand._id,
      modelCode: `${brand.brandCode}-${vData.modelSlug.toUpperCase().slice(0, 4)}`,
      name: vData.modelName,
      slug: vData.modelSlug,
      bodyType: vData.bodyType,
      status: 'active',
    });

    // 2. Create Generation
    const gen = await Generation.create({
      modelId: model._id,
      generationCode: `${model.modelCode}-${vData.genSlug.toUpperCase().slice(0, 4)}`,
      name: vData.genName,
      slug: vData.genSlug,
      status: 'active',
      startYear: 2023,
    });

    // 3. Create Variants & Associations
    for (const v of vData.variants) {
      const variant = await Variant.create({
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
      });
      variantCount++;

      // Create primary hero image Media
      const heroMedia = await Media.create({
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
      });

      // Create Specifications
      await Specification.create({
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
      });

      // Create VariantMarket (Price & Availability)
      await VariantMarket.create({
        variantId: variant._id,
        marketId: marketUAE._id,
        pricing: {
          amount: v.priceAED,
          currencyCode: 'AED',
          priceType: 'starting',
        },
        availabilityStatus: v.availabilityStatus,
        status: 'active',
      });

      // Create VariantColors
      for (const colorSlug of v.colorSlugs) {
        const colorDoc = colorMap[colorSlug];
        if (colorDoc) {
          await VariantColor.create({
            variantId: variant._id,
            colorId: colorDoc._id,
            availability: 'standard',
            status: 'active',
          });
        }
      }

      // Create VariantFeatures
      for (const featSlug of v.featureSlugs) {
        const featDoc = featureMap[featSlug];
        if (featDoc) {
          await VariantFeature.create({
            variantId: variant._id,
            featureId: featDoc._id,
            availability: 'standard',
            status: 'active',
          });
        }
      }

      // Create CostToOwn
      await CostToOwn.create({
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
      });
    }
  }

  // Ensure Admin user is available
  console.log('6. Ensuring Admin User...');
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

  console.log('\n======================================================');
  console.log('✅ CATALOG RESTORATION COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log(`- Brands Restored: ${brands.length}`);
  console.log(`- Models Restored: ${vehiclesToSeed.length}`);
  console.log(`- Variants Restored: ${variantCount}`);
  console.log(`- Features Restored: ${features.length}`);
  console.log(`- Colors Restored: ${allColors.length}`);
  console.log('======================================================\n');

  await mongoose.disconnect();
}

restoreFullCatalog().catch(err => {
  console.error('❌ Restoration failed:', err);
  process.exit(1);
});
