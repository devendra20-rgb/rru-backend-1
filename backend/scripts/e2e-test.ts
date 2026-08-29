import axios from 'axios';
import FormData from 'form-data';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { generateAccessToken } from '../src/utils/jwt';
import { User } from '../src/modules/users/user.model';
import { hashPassword } from '../src/utils/hash';

const API = process.env.API_URL || 'http://localhost:5000/api/v1';
const MONGODB_URI = process.env.MONGODB_URI;

const client = axios.create({ baseURL: API, timeout: 20000 });

async function uploadPlaceholderImage(entityType: string, entityId: string) {
  const placeholderUrl = 'https://placehold.co/600x400.png';
  const resp = await axios.get(placeholderUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(resp.data);

  const form = new FormData();
  form.append('file', buffer, { filename: 'logo.png', contentType: 'image/png' } as any);
  form.append('folder', 'brands');
  form.append('entityType', entityType);
  form.append('entityId', entityId);

  const headers = form.getHeaders();
  const r = await client.post('/media', form, { headers });
  return r.data.data;
}

async function run() {
  console.log('🚀 Starting E2E script against', API);
  try {
    await mongoose.connect(MONGODB_URI);

    // Find or create test admin user
    let admin = await User.findOne({ role: 'admin', status: 'active' });
    if (!admin) {
      const hashedPassword = await hashPassword('AdminPass123!');
      admin = await User.create({
        email: 'e2e-admin@rideroundup.com',
        username: 'e2eadmin',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        firstName: 'E2E',
        lastName: 'Admin',
      });
    }

    const token = generateAccessToken({ userId: admin._id.toString(), role: admin.role });
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log('✅ Authenticated as Admin User:', admin.email);

    // 1. Create a brand
    const brandPayload = {
      brandCode: `E2E${Math.floor(Math.random() * 9000) + 1000}`,
      name: `E2E Brand ${Date.now()}`,
      slug: `e2e-brand-${Date.now()}`,
      originCountryCode: 'US',
      websiteUrl: 'https://example.com',
    };

    const createBrandResp = await client.post('/brands', brandPayload);
    console.log('✅ Created Brand:', createBrandResp.data.data._id);
    const brandId = createBrandResp.data.data._id;

    // 2. Create a model for the brand
    const modelPayload = {
      brandId,
      modelCode: `E2EM${Math.floor(Math.random() * 9000) + 1000}`,
      name: `E2E Model ${Date.now()}`,
      slug: `e2e-model-${Date.now()}`,
    };
    const createModelResp = await client.post('/models', modelPayload);
    console.log('✅ Created Model:', createModelResp.data.data._id);
    const modelId = createModelResp.data.data._id;

    // 3. Upload media and attach to brand
    const media = await uploadPlaceholderImage('brand', brandId);
    console.log('✅ Uploaded media id:', media._id);

    // 4. Update brand with logoMediaId
    await client.patch(`/brands/${brandId}`, { logoMediaId: media._id });
    console.log('✅ Attached logo to brand');

    // 5. Fetch brand and model lists
    const brandsList = await client.get('/brands');
    console.log('✅ Brands count:', brandsList.data.data?.length || 0);

    const modelsList = await client.get('/models', { params: { brandId } });
    console.log('✅ Models for brand:', modelsList.data.data?.length || 0);

    // 6. Cleanup: delete created resources
    await client.delete(`/media/${media._id}`);
    console.log('✅ Deleted media');
    await client.delete(`/models/${modelId}`);
    console.log('✅ Deleted model');
    await client.delete(`/brands/${brandId}`);
    console.log('✅ Deleted brand');

    await mongoose.disconnect();
    console.log('\n🎉 E2E lifecycle script completed successfully with full CRUD operations!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ E2E run failed:', err.response?.data || err.message || err);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

run();
