import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { getErrorMessage } from '../utils/errorUtils';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error('Error occurred', {
    message: getErrorMessage(err),
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle different types of errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: getErrorMessage(err),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else {
    // General error
    res.status(500).json({
      success: false,
      error: getErrorMessage(err),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};