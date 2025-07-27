import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env, isDevelopment } from '../config/environment';
import { AppError } from "../types/ErrorTypes";
import { ApiResponse } from "../types/APITypes"

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error('Request error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle operational errors
  if (error instanceof AppError || (error as any).isOperational) {
    statusCode = (error as any).statusCode || 500;
    message = error.message;
    isOperational = true;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
    isOperational = true;
  }

  // Handle PocketBase errors
  if ((error as any).data && (error as any).status) {
    statusCode = (error as any).status;
    message = (error as any).data?.message || error.message;
    isOperational = true;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  // Prepare error response
  const errorResponse: ApiResponse = {
    success: false,
    error: message,
  };

  // Add stack trace in development
  if (isDevelopment && !isOperational) {
    (errorResponse as any).stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);

  // Exit process for non-operational errors in production
  if (!isOperational && !isDevelopment) {
    logger.error('Non-operational error occurred, shutting down...', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};