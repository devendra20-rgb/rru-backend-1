import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function checkCollections() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB:', mongoose.connection.name);
  const collections = await mongoose.connection.db?.listCollections().toArray();
  if (!collections) return;
  for (const col of collections) {
    const count = await mongoose.connection.db?.collection(col.name).countDocuments();
    const sample = await mongoose.connection.db?.collection(col.name).find().limit(2).toArray();
    console.log(`Collection: ${col.name} | Count: ${count}`);
    console.log('Sample:', JSON.stringify(sample, null, 2));
  }
  await mongoose.disconnect();
}

checkCollections().catch(console.error);
