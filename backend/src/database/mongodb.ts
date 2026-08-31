import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    // Safety guard: prevent tests from wiping the production database
    if (process.env.NODE_ENV === 'test' && env.MONGODB_URI && !env.MONGODB_URI.includes('_test')) {
      throw new Error(
        '🚫 TEST SAFETY: Tests are connecting to what looks like a NON-test database!\n' +
        'Ensure .env.test sets MONGODB_URI to a database ending in "_test" (e.g. rideroundup_test).\n' +
        `Current URI: ${env.MONGODB_URI.replace(/:\/\/[^@]+@/, '://***@')}`
      );
    }

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
