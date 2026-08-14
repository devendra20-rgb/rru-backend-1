import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

export const globalErrorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors: any[] = [];

  // Log error
  if (statusCode === 500) {
    logger.error({ err }, 'Unhandled Server Error');
  } else {
    logger.warn({ err }, 'Client Error');
  }

  // Handle specific errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Database validation failed';
    errors = Object.values(err.errors).map((el: any) => ({
      field: el.path,
      message: el.message,
    }));
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    const field = Object.keys(err.keyValue || {})[0];
    errors = [{ field, message: `The ${field} already exists` }];
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid ID format';
    errors = [{ field: err.path, message: `Invalid value ${err.value} for ${err.path}` }];
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your token has expired. Please log in again.';
  }

  sendError(res, statusCode, message, errors.length > 0 ? errors : undefined);
};
