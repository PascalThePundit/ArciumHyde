import { Request, Response } from 'express';
import { BillingService } from '../services/BillingService';
import { logger } from '../utils/logger';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

export class BillingController {
  /**
   * Get usage statistics for an API key
   */
  static async getUsage(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey } = req.params;

      if (!apiKey) {
        throw new BadRequestError('API key is required');
      }

      // Verify the API key has permission to access this data
      const requesterApiKey = req.headers['x-api-key'] as string;
      if (requesterApiKey !== apiKey) {
        // In a real implementation, we would check if the requester has admin privileges
        throw new UnauthorizedError('Access denied: cannot access another user\'s usage data');
      }

      const usage = await BillingService.getUsage(apiKey);
      
      res.status(200).json({
        success: true,
        usage,
        apiKey,
        timestamp: new Date().toISOString()
      });

      logger.info('Usage data requested', {
        userId: req.user?.id,
        apiKey,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Getting usage failed', { error: err.message, data: req.params });
      throw error;
    }
  }

  /**
   * Get account balance for an API key
   */
  static async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey } = req.params;

      if (!apiKey) {
        throw new BadRequestError('API key is required');
      }

      const balance = await BillingService.getBalance(apiKey);
      
      res.status(200).json({
        success: true,
        balance,
        apiKey,
        timestamp: new Date().toISOString()
      });

      logger.info('Balance requested', {
        userId: req.user?.id,
        apiKey,
        balance,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Getting balance failed', { error: err.message, data: req.params });
      throw error;
    }
  }

  /**
   * Charge an account for API usage
   */
  static async charge(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey } = req.params;
      const { amount, serviceType, operation } = req.body;

      if (!apiKey || amount === undefined || !serviceType || !operation) {
        throw new BadRequestError('API key, amount, service type, and operation are required');
      }

      const result = await BillingService.charge(apiKey, amount, serviceType, operation);
      
      res.status(200).json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });

      logger.info('Account charged', {
        userId: req.user?.id,
        apiKey,
        amount,
        serviceType,
        operation,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Charging account failed', { error: err.message, data: req.body });
      throw error;
    }
  }
}