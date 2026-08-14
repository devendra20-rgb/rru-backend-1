import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Health API', () => {
  it('should return 200 and success status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Ride Round Up API is running');
    expect(response.body.data.database).toBeDefined();
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/unknown-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
