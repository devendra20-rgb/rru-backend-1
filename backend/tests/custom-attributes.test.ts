import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { CustomAttribute } from '../src/modules/catalog/custom-attributes/custom-attribute.model';
import { generateAccessToken } from '../src/utils/jwt';

describe('Custom Attributes API', () => {
  let adminToken: string;
  let attributeId: string;

  beforeAll(async () => {
    await connectDB();
    adminToken = generateAccessToken({ userId: 'admin123', role: 'admin' });
    await CustomAttribute.deleteMany({});
  });

  afterAll(async () => {
    await CustomAttribute.deleteMany({});
    await disconnectDB();
  });

  it('should create a new custom attribute', async () => {
    const res = await request(app)
      .post('/api/v1/custom-attributes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Battery Capacity',
        key: 'battery_capacity',
        type: 'number',
        unit: 'kWh',
        appliesTo: 'variant',
        isRequired: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.key).toBe('battery_capacity');
    
    attributeId = res.body.data._id;
  });

  it('should fail to create custom attribute with duplicate key', async () => {
    const res = await request(app)
      .post('/api/v1/custom-attributes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Another Capacity',
        key: 'battery_capacity',
        type: 'text',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should fail to create select attribute without options', async () => {
    const res = await request(app)
      .post('/api/v1/custom-attributes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Drive Type',
        key: 'drive_type',
        type: 'select',
      });

    expect(res.status).toBe(400); // Validation error
  });

  it('should create select attribute with options', async () => {
    const res = await request(app)
      .post('/api/v1/custom-attributes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Drive Type',
        key: 'drive_type',
        type: 'select',
        options: ['AWD', 'RWD', 'FWD'],
      });

    expect(res.status).toBe(201);
  });

  it('should get a list of custom attributes with pagination', async () => {
    const res = await request(app).get('/api/v1/custom-attributes?limit=1&page=1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should get a single custom attribute', async () => {
    const res = await request(app).get(`/api/v1/custom-attributes/${attributeId}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Battery Capacity');
  });

  it('should update a custom attribute', async () => {
    const res = await request(app)
      .patch(`/api/v1/custom-attributes/${attributeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Updated Battery Capacity',
        unit: 'Wh',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Battery Capacity');
    expect(res.body.data.unit).toBe('Wh');
  });

  it('should delete a custom attribute', async () => {
    const res = await request(app)
      .delete(`/api/v1/custom-attributes/${attributeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/v1/custom-attributes/${attributeId}`);
    expect(getRes.status).toBe(404);
  });
});
