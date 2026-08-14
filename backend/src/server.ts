import app from './app';
import { env } from './config/env';
import { connectDB } from './database/mongodb';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start Express server
    const server = app.listen(env.PORT, () => {
      logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Swagger Docs available at http://localhost:${env.PORT}/api/docs`);
    });

    // Handle Unhandled Rejections
    process.on('unhandledRejection', (err: any) => {
      logger.error({ err }, 'Unhandled Rejection. Shutting down...');
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err: any) => {
      logger.error({ err }, 'Uncaught Exception. Shutting down...');
      process.exit(1);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal. Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
