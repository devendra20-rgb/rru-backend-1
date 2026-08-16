import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongodb';
import { User } from '../src/modules/users/user.model';
import { RefreshToken } from '../src/modules/auth/refresh-token.model';
import { hashPassword } from '../src/utils/hash';

describe('Auth API', () => {
  let activeUser: any;
  let inactiveUser: any;
  let refreshToken: string;
  let accessToken: string;

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
    await RefreshToken.deleteMany({});

    const activeHash = await hashPassword('password123');
    activeUser = await User.create({
      username: 'activeuser',
      email: 'active@test.com',
      password: activeHash,
      role: 'editor',
      status: 'active',
    });

    const inactiveHash = await hashPassword('password123');
    inactiveUser = await User.create({
      username: 'inactiveuser',
      email: 'inactive@test.com',
      password: inactiveHash,
      role: 'editor',
      status: 'inactive',
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
    await disconnectDB();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login an active user with email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'active@test.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined(); // Should not return password
      
      accessToken = res.body.data.accessToken;
      refreshToken = res.body.data.refreshToken;
    });

    it('should login an active user with username', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'activeuser', password: 'password123' });

      if (res.status !== 200) console.log(res.body);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'active@test.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject inactive user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'inactive@test.com', password: 'password123' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'notfound@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue new tokens with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.refreshToken).not.toBe(refreshToken); // Token rotation
      
      refreshToken = res.body.data.refreshToken; // Keep new one
    });

    it('should reject invalid or previously used refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout and revoke token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken });

      expect(res.status).toBe(200);

      // Try to use the revoked refresh token
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(401); // Should fail
    });
  });
});
