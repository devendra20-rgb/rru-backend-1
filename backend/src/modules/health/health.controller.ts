import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../../utils/response';

export const getHealth = (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  sendSuccess(res, 200, 'Ride Round Up API is running', {
    database: dbStatus,
  });
};
