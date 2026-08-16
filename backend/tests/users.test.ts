import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { User } from '../src/modules/users/user.model';
import { hashPassword } from '../src/utils/hash';
import { generateAccessToken } from '../src/utils/jwt';

describe('Users API', () => {
  let adminToken: string;
  let editorToken: string;
  let adminId: string;
  let targetUserId: string;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});

    const adminHash = await hashPassword('admin123');
    const admin = await User.create({
      username: 'adminuser',
      email: 'admin@test.com',
      password: adminHash,
      role: 'admin',
      status: 'active',
    });
    adminId = admin._id.toString();
    adminToken = generateAccessToken({ userId: adminId, role: 'admin' });

    const editorHash = await hashPassword('editor123');
    const editor = await User.create({
      username: 'editoruser',
      email: 'editor@test.com',
      password: editorHash,
      role: 'editor',
      status: 'active',
    });
    editorToken = generateAccessToken({ userId: editor._id.toString(), role: 'editor' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await disconnectDB();
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user (admin only)', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newuser',
          email: 'new@test.com',
          password: 'password123',
          role: 'editor',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('newuser');
      expect(res.body.data.password).toBeUndefined(); // Should not return password
      targetUserId = res.body.data._id;
    });

    it('should block editor from creating user', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          username: 'another',
          email: 'another@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(403);
    });

    it('should enforce unique email', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'diff',
          email: 'new@test.com', // same email
          password: 'password123',
        });

      expect(res.status).toBe(409); // Conflict
    });

    it('should enforce unique username', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: 'newuser', // same username
          email: 'diff@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(409); // Conflict
    });
  });

  describe('GET /api/v1/users', () => {
    it('should list users (admin only)', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta.total).toBe(3); // admin, editor, newuser
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe('editoruser');
      expect(res.body.data.role).toBe('editor');
    });
  });

  describe('PATCH /api/v1/users/me/password', () => {
    it('should reject incorrect current password', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ currentPassword: 'wrong', newPassword: 'newpassword123' });

      expect(res.status).toBe(400);
    });

    it('should change password with correct current password', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ currentPassword: 'editor123', newPassword: 'newpassword123' });

      expect(res.status).toBe(200);

      // Verify the new password works via login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'editoruser', password: 'newpassword123' });
        
      expect(loginRes.status).toBe(200);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update user details (admin only)', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('admin');
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should soft delete user (admin only)', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${targetUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('inactive');

      // Verify inactive user can't login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'newuser', password: 'password123' });
        
      expect(loginRes.status).toBe(403); // Inactive
    });
  });
});
