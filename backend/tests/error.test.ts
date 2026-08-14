import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { globalErrorHandler, notFoundHandler, AppError } from '../src/middlewares/error.middleware';

const app = express();

app.get('/error', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError('Custom Error Message', 400));
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

describe('Error Handling Middleware', () => {
  it('should handle AppError correctly', async () => {
    const response = await request(app).get('/error');
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Custom Error Message');
  });

  it('should handle not found routes correctly', async () => {
    const response = await request(app).get('/does-not-exist');
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Can\'t find');
  });
});
