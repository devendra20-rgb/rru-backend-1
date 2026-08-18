import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

const API = process.env.API_URL || 'http://localhost:5000/api/v1';

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
  console.log('Starting E2E script against', API);
  try {
    // 1. Create a brand
    const brandPayload = {
      brandCode: `E2E${Math.floor(Math.random() * 9000) + 1000}`,
      name: `E2E Brand ${Date.now()}`,
      slug: `e2e-brand-${Date.now()}`,
      originCountryCode: 'US',
      websiteUrl: 'https://example.com',
    };

    const createBrandResp = await client.post('/brands', brandPayload);
    console.log('Created Brand:', createBrandResp.data.data._id);
    const brandId = createBrandResp.data.data._id;

    // 2. Create a model for the brand
    const modelPayload = {
      brandId,
      modelCode: `E2EM${Math.floor(Math.random() * 9000) + 1000}`,
      name: `E2E Model ${Date.now()}`,
      slug: `e2e-model-${Date.now()}`,
    };
    const createModelResp = await client.post('/models', modelPayload);
    console.log('Created Model:', createModelResp.data.data._id);
    const modelId = createModelResp.data.data._id;

    // 3. Upload media and attach to brand
    const media = await uploadPlaceholderImage('brand', brandId);
    console.log('Uploaded media id:', media._id);

    // 4. Update brand with logoMediaId
    await client.patch(`/brands/${brandId}`, { logoMediaId: media._id });
    console.log('Attached logo to brand');

    // 5. Fetch brand and model lists
    const brandsList = await client.get('/brands');
    console.log('Brands count:', brandsList.data.data.length || brandsList.data.data?.length);

    const modelsList = await client.get('/models', { params: { brandId } });
    console.log('Models for brand:', modelsList.data.data.length || modelsList.data.data?.length);

    // 6. Cleanup: delete created resources
    await client.delete(`/media/${media._id}`);
    console.log('Deleted media');
    await client.delete(`/models/${modelId}`);
    console.log('Deleted model');
    await client.delete(`/brands/${brandId}`);
    console.log('Deleted brand');

    console.log('E2E script completed successfully');
  } catch (err: any) {
    console.error('E2E run failed:', err.response?.data || err.message || err);
    process.exit(1);
  }
}

run();
