import { Request, Response } from 'express';
import { PrivacyServiceRegistry } from '../services/PrivacyServiceRegistry';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/errors';

export class PrivacyServiceRegistryController {
  /**
   * List available privacy services
   */
  static async listServices(req: Request, res: Response): Promise<void> {
    try {
      const services = PrivacyServiceRegistry.getAvailableServices();
      
      res.status(200).json({
        success: true,
        services,
        count: services.length,
        timestamp: new Date().toISOString()
      });

      logger.info('Privacy services list requested', {
        userId: req.user?.id,
        serviceCount: services.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Listing services failed', { error: err.message });
      throw error;
    }
  }

  /**
   * List available privacy plugins
   */
  static async listPlugins(req: Request, res: Response): Promise<void> {
    try {
      const plugins = PrivacyServiceRegistry.getAvailablePlugins();
      
      res.status(200).json({
        success: true,
        plugins,
        count: plugins.length,
        timestamp: new Date().toISOString()
      });

      logger.info('Privacy plugins list requested', {
        userId: req.user?.id,
        pluginCount: plugins.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Listing plugins failed', { error: err.message });
      throw error;
    }
  }

  /**
   * Register a new privacy service
   */
  static async registerService(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, endpoint, authRequired, tags, schema } = req.body;

      if (!name || !endpoint) {
        throw new BadRequestError('Name and endpoint are required');
      }

      const service = PrivacyServiceRegistry.registerService({
        name,
        description,
        endpoint,
        authRequired: authRequired !== undefined ? authRequired : true,
        tags: tags || [],
        schema: schema || {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.status(201).json({
        success: true,
        service,
        message: 'Service registered successfully',
        timestamp: new Date().toISOString()
      });

      logger.info('New privacy service registered', {
        userId: req.user?.id,
        serviceName: service.name,
        endpoint: service.endpoint,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Service registration failed', { error: err.message, data: req.body });
      throw error;
    }
  }
}