import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { Review } from '../src/modules/reviews/review.model';
import { Variant } from '../src/modules/catalog/variants/variant.model';
import { User } from '../src/modules/users/user.model';
import { env } from '../src/config/env';
import jwt from 'jsonwebtoken';

const mockAdminId = '000000000000000000000001';
const mockUserId = '000000000000000000000002'; // Represents an editor

const adminToken = jwt.sign(
  { userId: mockAdminId, role: 'admin' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);

const editorToken = jwt.sign(
  { userId: mockUserId, role: 'editor' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);

describe('Reviews API', () => {
  let variantId: string;
  let adminReviewId: string;
  let editorReviewId: string;

  beforeAll(async () => {
    await connectDB();
    await Review.deleteMany({});
    await Variant.deleteMany({});
    await User.deleteMany({});

    const variant = await Variant.create({
      generationId: '000000000000000000000000', // Mock ID
      variantCode: 'TEST-VARIANT',
      name: 'Test Variant',
      slug: 'test-variant',
      fuelType: 'petrol',
      transmissionType: 'automatic',
    });
    variantId = variant._id.toString();

    await User.create({
      _id: mockAdminId,
      username: 'admin',
      email: 'admin@test.com',
      password: 'hashedpassword',
      role: 'admin',
    });

    await User.create({
      _id: mockUserId,
      username: 'editor',
      email: 'editor@test.com',
      password: 'hashedpassword',
      role: 'editor',
    });
  });

  afterAll(async () => {
    await Review.deleteMany({});
    await Variant.deleteMany({});
    await User.deleteMany({});
    await disconnectDB();
  });

  it('should create a review', async () => {
    const res = await request(app)
      .post(`/api/v1/variants/${variantId}/reviews`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        rating: 5,
        title: 'Great car!',
        body: 'Loved it.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.status).toBe('approved'); // Admins get approved immediately

    adminReviewId = res.body.data._id;
  });

  it('should fail creating duplicate review for same variant+user', async () => {
    const res = await request(app)
      .post(`/api/v1/variants/${variantId}/reviews`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        rating: 4,
        title: 'Another review',
      });

    expect(res.status).toBe(409);
  });

  it('should create review by editor', async () => {
    const res = await request(app)
      .post(`/api/v1/variants/${variantId}/reviews`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        rating: 3,
        title: 'Okay car.',
      });

    expect(res.status).toBe(201);
    editorReviewId = res.body.data._id;
    // For editors we set to 'approved' or 'pending' in the service, the code sets it to 'approved' for editors
  });

  it('should get public variant reviews with aggregate stats', async () => {
    const res = await request(app).get(`/api/v1/variants/${variantId}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.average).toBe(4); // (5+3)/2 = 4
    expect(res.body.meta.count).toBe(2);
  });

  it('should prevent editor from moderating another review status', async () => {
    const res = await request(app)
      .patch(`/api/v1/reviews/${adminReviewId}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        status: 'rejected',
      });

    expect(res.status).toBe(403);
  });

  it('should allow admin to moderate review status', async () => {
    const res = await request(app)
      .patch(`/api/v1/reviews/${editorReviewId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'rejected',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('rejected');
  });

  it('should omit rejected reviews from public endpoint', async () => {
    const res = await request(app).get(`/api/v1/variants/${variantId}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1); // Only the admin review is 'approved' now
  });

  it('should allow owner to delete their review', async () => {
    const res = await request(app)
      .delete(`/api/v1/reviews/${editorReviewId}`)
      .set('Authorization', `Bearer ${editorToken}`);

    expect(res.status).toBe(200);
  });
});
