import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { ContactService } from '../src/modules/contact/contact.service';
import nodemailer from 'nodemailer';

describe('POST /api/v1/contact', () => {
  beforeEach(() => {
    ContactService.setMockTransporter(null);
  });

  afterEach(() => {
    ContactService.setMockTransporter(null);
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/v1/contact').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 for an invalid email address', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      name: 'John Doe',
      email: 'not-an-email',
      subject: 'General Enquiry',
      message: 'Hello, this is a test message that has sufficient length.',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    const emailError = res.body.errors.find((e: any) => e.field === 'email');
    expect(emailError).toBeDefined();
  });

  it('should return 400 if message is shorter than 10 characters', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'General Enquiry',
      message: 'Too short',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 503 when SMTP provider is unconfigured', async () => {
    // Ensure no mock transporter is set
    ContactService.setMockTransporter(null);

    const res = await request(app).post('/api/v1/contact').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'general',
      message: 'This is a valid test message with more than 10 characters.',
    });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not configured');
  });

  it('should return 200 when email provider successfully delivers mail', async () => {
    // Set a mock nodemailer transporter
    const mockTransporter = {
      sendMail: async () => ({ messageId: 'test-message-12345' }),
    } as unknown as nodemailer.Transporter;

    ContactService.setMockTransporter(mockTransporter);

    const res = await request(app).post('/api/v1/contact').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'General Enquiry',
      message: 'This is a valid test message with more than 10 characters.',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('successfully');
  });

  it('should return 500 when email provider fails during delivery', async () => {
    // Set a mock transporter that fails
    const mockTransporter = {
      sendMail: async () => {
        throw new Error('SMTP Connection Refused');
      },
    } as unknown as nodemailer.Transporter;

    ContactService.setMockTransporter(mockTransporter);

    const res = await request(app).post('/api/v1/contact').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'General Enquiry',
      message: 'This is a valid test message with more than 10 characters.',
    });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Email delivery failed');
  });
});
