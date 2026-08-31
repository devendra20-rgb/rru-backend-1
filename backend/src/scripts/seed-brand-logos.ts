import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedLogos() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rideroundup';
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) {
    console.error('No DB connection');
    return;
  }

  const Media = db.collection('media');
  const Brands = db.collection('brands');

  const brandLogos = [
    { slug: 'toyota', name: 'Toyota', url: 'https://www.carlogos.org/car-logos/toyota-logo.png' },
    { slug: 'nissan', name: 'Nissan', url: 'https://www.carlogos.org/car-logos/nissan-logo.png' },
    { slug: 'bmw', name: 'BMW', url: 'https://www.carlogos.org/car-logos/bmw-logo.png' },
    { slug: 'mercedes-benz', name: 'Mercedes-Benz', url: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png' },
    { slug: 'hyundai', name: 'Hyundai', url: 'https://www.carlogos.org/car-logos/hyundai-logo.png' },
    { slug: 'kia', name: 'Kia', url: 'https://www.carlogos.org/car-logos/kia-logo.png' },
    { slug: 'audi', name: 'Audi', url: 'https://www.carlogos.org/car-logos/audi-logo.png' },
    { slug: 'lexus', name: 'Lexus', url: 'https://www.carlogos.org/car-logos/lexus-logo.png' },
    { slug: 'tesla', name: 'Tesla', url: 'https://www.carlogos.org/car-logos/tesla-logo.png' },
    { slug: 'ford', name: 'Ford', url: 'https://www.carlogos.org/car-logos/ford-logo.png' },
    { slug: 'chevrolet', name: 'Chevrolet', url: 'https://www.carlogos.org/car-logos/chevrolet-logo.png' },
    { slug: 'honda', name: 'Honda', url: 'https://www.carlogos.org/car-logos/honda-logo.png' },
    { slug: 'land-rover', name: 'Land Rover', url: 'https://www.carlogos.org/car-logos/land-rover-logo.png' },
    { slug: 'porsche', name: 'Porsche', url: 'https://www.carlogos.org/car-logos/porsche-logo.png' }
  ];

  for (const item of brandLogos) {
    const brand = await Brands.findOne({ slug: item.slug });
    if (!brand) {
      console.log('Brand not found:', item.slug);
      continue;
    }

    const storageKey = `brands/${item.slug}-logo.png`;
    const mediaDoc = {
      folder: 'brands',
      entityType: 'brand',
      entityId: brand._id,
      mediaType: 'image',
      storageProvider: 'local',
      storageKey,
      url: item.url,
      originalName: `${item.slug}-logo.png`,
      mimeType: 'image/png',
      size: 1024,
      status: 'active',
      updatedAt: new Date()
    };

    const res = await Media.findOneAndUpdate(
      { storageKey },
      { $set: mediaDoc, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );
    if (res) {
      await Brands.updateOne({ _id: brand._id }, { $set: { logoMediaId: res._id } });
      console.log(`Updated ${item.name} with logoMediaId: ${res._id}`);
    }
  }

  await mongoose.disconnect();
}

seedLogos().catch(console.error);
