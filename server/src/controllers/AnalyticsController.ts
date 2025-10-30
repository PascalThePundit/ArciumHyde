import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { logger } from '../utils/logger';
import { UnauthorizedError } from '../utils/errors';

export class AnalyticsController {
  /**
   * Get overall usage statistics
   */
  static async getUsageStats(req: Request, res: Response): Promise<void> {
    try {
      // Only allow admin users to access overall stats
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        throw new UnauthorizedError('Admin access required for overall usage statistics');
      }

      const stats = await AnalyticsService.getUsageStats();
      
      res.status(200).json({
        success: true,
        stats,
        timestamp: new Date().toISOString()
      });

      logger.info('Overall usage stats requested by admin', {
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Getting usage stats failed', { error: err.message });
      throw error;
    }
  }

  /**
   * Get usage statistics for a specific user
   */
  static async getUserUsage(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey } = req.params;

      if (!apiKey) {
        throw new UnauthorizedError('API key is required');
      }

      // Verify the API key has permission to access this data
      const requesterApiKey = req.headers['x-api-key'] as string;
      if (requesterApiKey !== apiKey) {
        // For this implementation, only allow access to own data
        // In a full implementation, admins might have broader access
        throw new UnauthorizedError('Access denied: cannot access another user\'s usage data');
      }

      const usage = await AnalyticsService.getUserUsage(apiKey);
      
      res.status(200).json({
        success: true,
        usage,
        apiKey,
        timestamp: new Date().toISOString()
      });

      logger.info('User-specific usage stats requested', {
        userId: req.user?.id,
        apiKey,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Getting user usage failed', { error: err.message, data: req.params });
      throw error;
    }
  }

  /**
   * Get service health and performance metrics
   */
  static async getServiceHealth(req: Request, res: Response): Promise<void> {
    try {
      // Only allow admin users to access health metrics
      const apiKey = req.headers['x-api-key'] as string;
      if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
        throw new UnauthorizedError('Admin access required for service health metrics');
      }

      const health = await AnalyticsService.getServiceHealth();
      
      res.status(200).json({
        success: true,
        health,
        timestamp: new Date().toISOString()
      });

      logger.info('Service health metrics requested by admin', {
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Getting service health failed', { error: err.message });
      throw error;
    }
  }
}