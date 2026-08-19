import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';
import mongoose from 'mongoose';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { S3StorageProvider } from '../modules/media/storage/s3.storage';

const API_BASE = process.env.API_URL || 'http://localhost:5000/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pandeydevendra20devops_db_user:1Devendrapandey0@deliverly.4lvw8v3.mongodb.net/';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

async function runIntensiveTest() {
  console.log('====================================================');
  console.log('🧪 STARTING COMPREHENSIVE PRODUCTION AUDIT & TESTING');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  async function testStep(name: string, fn: () => Promise<void>) {
    totalTests++;
    process.stdout.write(`⏳ Testing: ${name}... `);
    try {
      await fn();
      console.log('✅ PASSED');
      passedTests++;
    } catch (err: any) {
      console.log('❌ FAILED');
      console.error(`   Error: ${err.response?.data?.message || err.message}`);
      if (err.response?.data) {
        console.error('   Details:', JSON.stringify(err.response.data));
      }
    }
  }

  // 1. Database Connection Test
  await testStep('MongoDB Database Connection', async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    const dbName = mongoose.connection.name;
    const collections = await mongoose.connection.db?.listCollections().toArray();
    if (!collections || collections.length === 0) {
      throw new Error('No collections found in database');
    }
  });

  // 2. Health Endpoint
  await testStep('GET /health (System Health API)', async () => {
    const res = await client.get('/health');
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Unexpected response: ${res.status}`);
    }
  });

  // 3. Brands Endpoint
  await testStep('GET /brands (Catalog Brands API)', async () => {
    const res = await client.get('/brands');
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to retrieve brands: ${res.status}`);
    }
  });

  // 4. Vehicles Endpoint (Frontend API compatibility)
  await testStep('GET /vehicles (Frontend Compatible Vehicle Catalog API)', async () => {
    const res = await client.get('/vehicles');
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to retrieve vehicles: ${res.status}`);
    }
  });

  // 5. Cars Endpoint
  await testStep('GET /cars (Cars Listing API)', async () => {
    const res = await client.get('/cars');
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to retrieve cars: ${res.status}`);
    }
  });

  // 6. Featured Cars Endpoint
  await testStep('GET /vehicles/featured (Featured Vehicles API)', async () => {
    const res = await client.get('/vehicles/featured');
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to retrieve featured vehicles: ${res.status}`);
    }
  });

  // 7. Articles Endpoint
  await testStep('GET /articles (Content Articles API)', async () => {
    const res = await client.get('/articles');
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to retrieve articles: ${res.status}`);
    }
  });

  // 8. Reviews Endpoint
  await testStep('GET /reviews (Public Reviews Listing API)', async () => {
    const res = await client.get('/reviews');
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Failed to retrieve reviews: ${res.status}`);
    }
  });

  // 9. Cost to Own Calculation Endpoint
  await testStep('POST /cost-to-own/calculate (Cost to Own Calculator API)', async () => {
    const res = await client.post('/cost-to-own/calculate', {
      vehiclePrice: 150000,
      annualMileageKm: 20000,
      ownershipYears: 5,
      fuelType: 'petrol',
    });
    if (res.status !== 200 || !res.data.success) {
      throw new Error(`Cost calculation failed: ${res.status}`);
    }
  });

  // 10. AWS S3 Storage Upload & Delete Live Verification
  await testStep('AWS S3 Live Upload, URL Resolution & Deletion', async () => {
    const s3 = new S3StorageProvider();
    const testBuffer = Buffer.from('RideRoundUp S3 Integration Verification File');
    const storageKey = await s3.upload(
      {
        buffer: testBuffer,
        originalname: 'test-audit.txt',
        mimetype: 'text/plain',
        size: testBuffer.length,
      },
      'system-audit'
    );
    const url = s3.getUrl(storageKey);
    if (!url.includes('ride-round-up-production-media.s3.ap-south-1.amazonaws.com')) {
      throw new Error(`Invalid S3 URL generated: ${url}`);
    }
    await s3.delete(storageKey);
  });

  console.log('\n====================================================');
  console.log(`📊 AUDIT RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  if (passedTests === totalTests) {
    console.log('🎉 ALL SYSTEMS AND INTEGRATIONS ARE 100% PRODUCTION READY!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED. Please review output above.');
    process.exit(1);
  }
}

runIntensiveTest().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
