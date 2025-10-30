import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { logger } from '../utils/logger';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { generateApiKey } from '../utils/helpers';

export class AuthenticationController {
  /**
   * Register a new user/api key for the privacy services
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, organization, useCase } = req.body;

      if (!email || !name) {
        throw new BadRequestError('Email and name are required');
      }

      // Check if user already exists
      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        throw new BadRequestError('User with this email already exists');
      }

      // Generate API key
      const apiKey = generateApiKey();
      
      // Create user with initial credits
      const user = await UserService.createUser({
        email,
        name,
        organization,
        useCase,
        apiKey,
        credits: 1000, // Initial credits for new users
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organization: user.organization,
          useCase: user.useCase,
          apiKey: user.apiKey,
          credits: user.credits
        }
      });

      logger.info('New user registered', {
        userId: user.id,
        email: user.email,
        organization: user.organization,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('User registration failed', { error: err.message, data: req.body });
      throw error;
    }
  }

  /**
   * Login and get API token
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey } = req.body;

      if (!apiKey) {
        throw new BadRequestError('API key is required');
      }

      const user = await UserService.findByApiKey(apiKey);
      if (!user) {
        throw new UnauthorizedError('Invalid API key');
      }

      // In a real implementation, we would generate a JWT token
      // For this demo, we'll just return user info
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organization: user.organization,
          useCase: user.useCase,
          apiKey: user.apiKey,
          credits: user.credits
        }
      });

      logger.info('User login successful', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('User login failed', { error: err.message, data: req.body });
      throw error;
    }
  }

  /**
   * Verify an API token
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { apiKey } = req.body;

      if (!apiKey) {
        throw new BadRequestError('API key is required');
      }

      const user = await UserService.findByApiKey(apiKey);
      if (!user) {
        throw new UnauthorizedError('Invalid API key');
      }

      res.status(200).json({
        success: true,
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          credits: user.credits
        }
      });

      logger.info('Token verification successful', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Token verification failed', { error: err.message, data: req.body });
      throw error;
    }
  }
}