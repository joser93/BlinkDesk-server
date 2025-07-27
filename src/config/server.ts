import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './environment';
import { logger } from '../utils/logger';
import routes from '../routes';

export function createServer(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS configuration
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  //app.use(rateLimiter);

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // API routes will be added here
  app.use('/api', routes);

  // Error handling middleware (must be last)
  //app.use(errorHandler);

  return app;
}
