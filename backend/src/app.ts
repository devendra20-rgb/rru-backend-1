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
import variantRoutes from './modules/catalog/variants/variant.routes';
import marketRoutes from './modules/catalog/markets/market.routes';
import variantMarketRoutes from './modules/catalog/variant-markets/variant-market.routes';
import { specificationRoutes } from './modules/catalog/specifications/specification.routes';
import { featureRouter, variantFeatureRouter } from './modules/catalog/features/feature.routes';
import { colorRouter, variantColorRouter } from './modules/catalog/colors/color.routes';
import mediaRoutes from './modules/media/media.routes';
import userRoutes from './modules/users/user.routes';
import authRoutes from './modules/auth/auth.routes';
import carsRoutes from './modules/catalog/cars/cars.routes';
import costToOwnRoutes from './modules/catalog/cost-to-own/cost-to-own.routes';
import reviewRoutes from './modules/reviews/review.routes';
import articleRoutes from './modules/articles/article.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Files (Media Uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
v1Router.use('/', reviewRoutes); // Mount before variants to avoid variant routes intercepting /variants/:variantId/reviews
v1Router.use('/variants', variantRoutes);
v1Router.use('/markets', marketRoutes);
v1Router.use('/variant-markets', variantMarketRoutes);
v1Router.use('/specifications', specificationRoutes);
v1Router.use('/features', featureRouter);
v1Router.use('/variant-features', variantFeatureRouter);
v1Router.use('/colors', colorRouter);
v1Router.use('/variant-colors', variantColorRouter);
v1Router.use('/media', mediaRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/cars', carsRoutes);
v1Router.use('/vehicles', carsRoutes);
v1Router.use('/cost-to-own', costToOwnRoutes);
v1Router.use('/articles', articleRoutes);
v1Router.use('/dashboard', dashboardRoutes);

// Register API Routes
app.use('/api/v1', v1Router);

// Error Handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
