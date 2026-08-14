import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import { env } from './config/env';
import { logger } from './utils/logger';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware';

import healthRoutes from './modules/health/health.routes';
import brandRoutes from './modules/catalog/brands/brand.routes';
import modelRoutes from './modules/catalog/models/model.routes';
import generationRoutes from './modules/catalog/generations/generation.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/api/v1/health',
    },
  }),
);

// Swagger Documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
const v1Router = express.Router();

v1Router.use('/health', healthRoutes);
v1Router.use('/brands/:brandId/models', modelRoutes);
v1Router.use('/brands', brandRoutes);
v1Router.use('/models/:modelId/generations', generationRoutes);
v1Router.use('/models', modelRoutes);
v1Router.use('/generations', generationRoutes);

// Register API Routes
app.use('/api/v1', v1Router);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
