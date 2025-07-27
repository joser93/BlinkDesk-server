import winston from 'winston';
import { env, isDevelopment } from '../config/environment.js';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: env.LOG_LEVEL,
    format: isDevelopment ? consoleFormat : logFormat,
  }),
];

// File transports for production
if (!isDevelopment) {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Helper functions for structured logging
export const logHelpers = {
  request: (method: string, path: string, statusCode: number, duration: number) => {
    logger.info('HTTP Request', {
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
      type: 'request'
    });
  },

  error: (error: Error, context?: Record<string, any>) => {
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
      type: 'error'
    });
  },

  security: (event: string, details: Record<string, any>) => {
    logger.warn('Security Event', {
      event,
      ...details,
      type: 'security'
    });
  },

  database: (operation: string, collection: string, duration?: number) => {
    logger.debug('Database Operation', {
      operation,
      collection,
      duration: duration ? `${duration}ms` : undefined,
      type: 'database'
    });
  },

  auth: (event: string, userId?: string, details?: Record<string, any>) => {
    logger.info('Authentication Event', {
      event,
      userId,
      ...details,
      type: 'auth'
    });
  }
};

// Handle uncaught exceptions and unhandled rejections
if (!isDevelopment) {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection', { reason });
    process.exit(1);
  });
}
