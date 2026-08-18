import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/';

import { Brand } from '../src/modules/catalog/brands/brand.model';
import { Color } from '../src/modules/catalog/colors/color.model';
import { VehicleModel } from '../src/modules/catalog/models/model.model';
import { Media } from '../src/modules/media/media.model';

async function seed() {
  await mongoose.connect(MONGODB_URI as string);
  console.log('Connected to MongoDB for seeding');

  // Brands
  const brands = [
    { brandCode: 'TES', name: 'Test Motors', slug: 'test-motors', originCountryCode: 'US', websiteUrl: 'https://testmotors.example' },
    { brandCode: 'NOV', name: 'Nova Auto', slug: 'nova-auto', originCountryCode: 'DE', websiteUrl: 'https://nova.example' },
    { brandCode: 'ORV', name: 'Orville Cars', slug: 'orville-cars', originCountryCode: 'JP', websiteUrl: 'https://orville.example' },
  ];

  const brandDocs = [] as any[];
  for (const b of brands) {
    const doc = await Brand.findOneAndUpdate({ brandCode: b.brandCode }, { $set: b }, { upsert: true, returnDocument: 'after' as any });
    brandDocs.push(doc);
  }

  // Colors
  const colors = [
    { name: 'Midnight Black', slug: 'midnight-black', hexCode: '#000000', type: 'exterior' },
    { name: 'Arctic White', slug: 'arctic-white', hexCode: '#FFFFFF', type: 'exterior' },
    { name: 'Canyon Red', slug: 'canyon-red', hexCode: '#B22222', type: 'exterior' },
  ];

  const colorDocs = [] as any[];
  for (const c of colors) {
    const doc = await Color.findOneAndUpdate({ slug: c.slug }, { $set: c }, { upsert: true, returnDocument: 'after' as any });
    colorDocs.push(doc);
  }

  // Media (logo for first brand)
  const logo = await Media.findOneAndUpdate(
    { storageKey: 'logo-test-motors' },
    {
      $set: {
        folder: 'brands',
        entityType: 'brand',
        entityId: brandDocs[0]._id,
        mediaType: 'image',
        storageProvider: 'local',
        storageKey: 'logo-test-motors',
        url: 'https://placehold.co/600x400.png',
        originalName: 'logo.png',
        mimeType: 'image/png',
        size: 12345,
        isPrimary: true,
      },
    },
    { upsert: true, returnDocument: 'after' as any },
  );

  // Attach logoMediaId to brand
  await Brand.findByIdAndUpdate(brandDocs[0]._id, { $set: { logoMediaId: logo._id } });

  // Models (link to first brand)
  const models = [
    { brandId: brandDocs[0]._id, modelCode: 'TES-M1', name: 'Test Model One', slug: 'test-model-one', bodyType: 'sedan', launchYear: 2024, status: 'active' },
    { brandId: brandDocs[0]._id, modelCode: 'TES-M2', name: 'Test Model Two', slug: 'test-model-two', bodyType: 'suv', launchYear: 2025, status: 'draft' },
  ];

  for (const m of models) {
    await VehicleModel.findOneAndUpdate({ modelCode: m.modelCode }, { $set: m }, { upsert: true, returnDocument: 'after' as any });
  }

  console.log('Seeding complete');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
