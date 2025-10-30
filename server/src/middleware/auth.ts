import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; // In a real implementation, this would be a typed user object
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedError('API key is required');
    }

    // Verify the API key exists and is valid
    const user = await UserService.findByApiKey(apiKey);
    if (!user) {
      throw new UnauthorizedError('Invalid API key');
    }

    // Attach user to request object
    req.user = user;

    // Check if user has sufficient credits (for paid operations)
    // This is a simplified check - in a real implementation you'd check per-operation costs
    if (req.path.includes('/encrypt') || 
        req.path.includes('/zk-proof') || 
        req.path.includes('/selective-disclosure')) {
      if (user.credits <= 0) {
        throw new UnauthorizedError('Insufficient credits for this operation');
      }
    }

    next();
  } catch (error: unknown) {
    const err = error as Error;
    logger.error('Authentication failed', { 
      error: err.message, 
      path: req.originalUrl,
      apiKey: req.headers['x-api-key']
    });
    throw error;
  }
};