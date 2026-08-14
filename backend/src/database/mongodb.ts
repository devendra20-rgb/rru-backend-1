import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error({ err: error }, 'MongoDB Connection Error');
    // We do not want to fake a successful connection, so we let the error propagate or kill process
    throw error;
  }
};

export const disconnectDB = async () => {
  await mongoose.connection.close();
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB Disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB Connection Closed due to app termination');
  process.exit(0);
});
