import { Request, Response } from 'express';
import { LazyDecryptionService } from '../services/LazyDecryptionService';
import { ViewportDecryptionService } from '../services/ViewportDecryptionService';
import { logger } from '../utils/logger';

export class LazyDecryptionController {
  private lazyDecryptionService: LazyDecryptionService;
  private viewportDecryptionService: ViewportDecryptionService;

  constructor() {
    this.lazyDecryptionService = LazyDecryptionService.getInstance();
    this.viewportDecryptionService = ViewportDecryptionService.getInstance();
  }

  /**
   * Decrypt data on demand
   */
  async decryptOnDemand(req: Request, res: Response): Promise<void> {
    try {
      const { encryptedData, password, options = {} } = req.body;

      if (!encryptedData || !password) {
        res.status(400).json({
          success: false,
          error: 'encryptedData and password are required'
        });
        return;
      }

      const result = await this.lazyDecryptionService.decryptOnDemand(
        encryptedData,
        password,
        options
      );

      res.status(200).json({
        success: true,
        decryptedData: result,
        timestamp: new Date().toISOString()
      });

      logger.info('On-demand decryption completed', {
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('On-demand decryption failed', { error: err.message, data: req.body });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Decrypt data in viewport
   */
  async decryptInViewport(req: Request, res: Response): Promise<void> {
    try {
      const { items, viewportParams, options = {} } = req.body;

      if (!Array.isArray(items) || !viewportParams) {
        res.status(400).json({
          success: false,
          error: 'items array and viewportParams are required'
        });
        return;
      }

      const result = await this.viewportDecryptionService.getDecryptedInViewport(viewportParams);

      res.status(200).json({
        success: true,
        decryptedData: result,
        timestamp: new Date().toISOString()
      });

      logger.info('Viewport decryption completed', {
        userId: req.user?.id,
        itemCount: items.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Viewport decryption failed', { error: err.message, data: req.body });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Handle viewport change (new scroll position)
   */
  async handleViewportChange(req: Request, res: Response): Promise<void> {
    try {
      const { viewportParams } = req.body;

      if (!viewportParams) {
        res.status(400).json({
          success: false,
          error: 'viewportParams are required'
        });
        return;
      }

      const result = await this.viewportDecryptionService.handleViewportChange(viewportParams);

      res.status(200).json({
        success: true,
        decryptedData: result,
        timestamp: new Date().toISOString()
      });

      logger.info('Viewport change handled', {
        userId: req.user?.id,
        viewportParams,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Viewport change handling failed', { error: err.message, data: req.body });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Get decryption analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const lazyAnalytics = this.lazyDecryptionService.getAnalytics();
      const viewportAnalytics = this.viewportDecryptionService.getAnalytics();

      res.status(200).json({
        success: true,
        analytics: {
          lazyDecryption: lazyAnalytics,
          viewportDecryption: viewportAnalytics,
          overall: {
            memorySavedEstimate: lazyAnalytics.memorySaved + viewportAnalytics.estimatedMemorySaved,
            efficiencyScore: this.calculateEfficiencyScore(lazyAnalytics, viewportAnalytics)
          }
        },
        timestamp: new Date().toISOString()
      });

      logger.info('Decryption analytics retrieved', {
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Analytics retrieval failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Get queue status
   */
  async getQueueStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = this.lazyDecryptionService.getQueueStatus();

      res.status(200).json({
        success: true,
        status,
        timestamp: new Date().toISOString()
      });

      logger.info('Decryption queue status retrieved', {
        userId: req.user?.id,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Queue status retrieval failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Pre-decrypt items for navigation
   */
  async predecryptForNavigation(req: Request, res: Response): Promise<void> {
    try {
      const { viewportParams } = req.body;

      if (!viewportParams) {
        res.status(400).json({
          success: false,
          error: 'viewportParams are required'
        });
        return;
      }

      await this.viewportDecryptionService.predecrypForNavigation(viewportParams);

      res.status(200).json({
        success: true,
        message: 'Pre-decryption initiated',
        timestamp: new Date().toISOString()
      });

      logger.info('Pre-decryption for navigation initiated', {
        userId: req.user?.id,
        viewportParams,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Pre-decryption failed', { error: err.message, data: req.body });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Calculate efficiency score based on analytics
   */
  private calculateEfficiencyScore(
    lazyAnalytics: any, 
    viewportAnalytics: any
  ): number {
    // Calculate an efficiency score based on various metrics
    // Higher score means better efficiency
    
    // Cache hit rate impact (0-40 points)
    const cacheHitRate = lazyAnalytics.totalDecryptions > 0 
      ? (lazyAnalytics.cachedDecryptions / lazyAnalytics.totalDecryptions) * 40
      : 0;
    
    // Memory saved impact (0-30 points)
    const memorySavedImpact = Math.min(30, viewportAnalytics.estimatedMemorySaved / 10); // Assuming 1 point per 10MB saved
    
    // Queue efficiency (0-30 points)
    const queueEfficiency = lazyAnalytics.totalDecryptions > 0
      ? (1 - (lazyAnalytics.onDemandDecryptions / lazyAnalytics.totalDecryptions)) * 30
      : 0;
    
    return Math.round(cacheHitRate + memorySavedImpact + queueEfficiency);
  }
}