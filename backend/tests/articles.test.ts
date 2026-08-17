import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { Article } from '../src/modules/articles/article.model';
import { User } from '../src/modules/users/user.model';
import { env } from '../src/config/env';
import jwt from 'jsonwebtoken';

const mockAdminId = '000000000000000000000001';
const mockEditorId = '000000000000000000000002';
const mockUserId = '000000000000000000000003';

const adminToken = jwt.sign(
  { userId: mockAdminId, role: 'admin' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);

const editorToken = jwt.sign(
  { userId: mockEditorId, role: 'editor' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);

const userToken = jwt.sign(
  { userId: mockUserId, role: 'user' },
  env.JWT_ACCESS_SECRET || 'test_secret',
  { expiresIn: '1h' },
);

describe('Articles API', () => {
  let articleId: string;

  beforeAll(async () => {
    await connectDB();
    await Article.deleteMany({});
    await User.deleteMany({});

    await User.create([
      {
        _id: mockAdminId,
        username: 'admin',
        email: 'admin@test.com',
        password: 'hashedpassword',
        role: 'admin',
      },
      {
        _id: mockEditorId,
        username: 'editor',
        email: 'editor@test.com',
        password: 'hashedpassword',
        role: 'editor',
      }
    ]);
  });

  afterAll(async () => {
    await Article.deleteMany({});
    await User.deleteMany({});
    await disconnectDB();
  });

  it('should prevent unauthenticated users from creating articles', async () => {
    const res = await request(app)
      .post('/api/v1/articles')
      .send({
        title: 'Test Article',
        slug: 'test-article-user',
        content: 'This is some content for the article.',
        category: 'news',
      });

    expect(res.status).toBe(401);
  });

  it('should allow admin to create an article', async () => {
    const res = await request(app)
      .post('/api/v1/articles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Admin Article',
        slug: 'admin-article',
        content: 'Content by admin over 10 chars.',
        category: 'news',
        status: 'published'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('admin-article');
    expect(res.body.data.status).toBe('published');
    expect(res.body.data.authorId).toBe(mockAdminId); // Automatically injected

    articleId = res.body.data._id;
  });

  it('should allow editor to create a draft article', async () => {
    const res = await request(app)
      .post('/api/v1/articles')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        title: 'Editor Draft',
        slug: 'editor-draft',
        content: 'Content by editor over 10 chars.',
        category: 'reviews',
        // Omitting status should default to draft
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('draft');
  });

  it('should fail to create article with duplicate slug', async () => {
    const res = await request(app)
      .post('/api/v1/articles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Duplicate Slug',
        slug: 'admin-article', // Already used
        content: 'Some more content here.',
        category: 'news',
      });

    expect(res.status).toBe(409);
  });

  it('should only return published articles to public/unauthenticated users', async () => {
    const res = await request(app).get('/api/v1/articles');
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].slug).toBe('admin-article');
  });

  it('should return all articles to admins', async () => {
    const res = await request(app)
      .get('/api/v1/articles')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2); // Published + Draft
  });

  it('should get a single published article by slug', async () => {
    const res = await request(app).get('/api/v1/articles/slug/admin-article');
    
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Admin Article');
  });

  it('should prevent public users from fetching a draft article by slug', async () => {
    const res = await request(app).get('/api/v1/articles/slug/editor-draft');
    
    expect(res.status).toBe(404); // Or 403, depending on implementation
  });

  it('should allow editor to update an article', async () => {
    const res = await request(app)
      .patch(`/api/v1/articles/${articleId}`)
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        title: 'Updated Admin Article',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Admin Article');
  });

  it('should allow admin to delete an article', async () => {
    const res = await request(app)
      .delete(`/api/v1/articles/${articleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const check = await request(app)
      .get(`/api/v1/articles/${articleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(check.status).toBe(404);
  });
});
