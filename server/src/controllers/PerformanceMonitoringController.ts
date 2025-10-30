import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { PerformanceMetrics, PerformanceService } from '../services/PerformanceService';

export class PerformanceMonitoringController {
  /**
   * Get performance metrics
   */
  static async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await PerformanceService.getMetrics();
      
      res.status(200).json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });

      logger.info('Performance metrics retrieved', {
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Getting performance metrics failed', { error: err.message });
      throw error;
    }
  }

  /**
   * Get performance metrics for a specific operation
   */
  static async getOperationMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { operation } = req.params;
      const { startTime, endTime } = req.query;

      const metrics = await PerformanceService.getOperationMetrics(
        operation,
        startTime ? new Date(startTime as string) : undefined,
        endTime ? new Date(endTime as string) : undefined
      );
      
      res.status(200).json({
        success: true,
        data: metrics,
        operation,
        timestamp: new Date().toISOString()
      });

      logger.info('Operation performance metrics retrieved', {
        userId: req.user?.id,
        operation,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Getting operation metrics failed', { error: err.message, operation: req.params.operation });
      throw error;
    }
  }

  /**
   * Get performance trends
   */
  static async getPerformanceTrends(req: Request, res: Response): Promise<void> {
    try {
      const { operation, period } = req.query;

      const trends = await PerformanceService.getPerformanceTrends(
        operation as string,
        period as string
      );
      
      res.status(200).json({
        success: true,
        data: trends,
        operation,
        period,
        timestamp: new Date().toISOString()
      });

      logger.info('Performance trends retrieved', {
        userId: req.user?.id,
        operation,
        period,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Getting performance trends failed', { error: err.message });
      throw error;
    }
  }

  /**
   * Get performance alerts
   */
  static async getPerformanceAlerts(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await PerformanceService.getPerformanceAlerts();
      
      res.status(200).json({
        success: true,
        data: alerts,
        timestamp: new Date().toISOString()
      });

      logger.info('Performance alerts retrieved', {
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Getting performance alerts failed', { error: err.message });
      throw error;
    }
  }
}