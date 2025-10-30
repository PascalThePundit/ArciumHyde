import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from '../services/EncryptionService';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/errors';

export class EncryptionController {
  /**
   * Encrypts data using the specified encryption method
   */
  static async encrypt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data, method, publicKey, password } = req.body;

      if (!data) {
        throw new BadRequestError('Data to encrypt is required');
      }

      const encryptedData = await EncryptionService.encrypt(data, method, publicKey, password);
      
      res.status(200).json({
        success: true,
        encryptedData,
        method,
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      // req.user is expected to be populated by an authentication middleware
      logger.info('Encryption operation completed', {
        userId: req.user?.id,
        method,
        dataSize: Buffer.byteLength(data),
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Encryption failed', { error: err, data: req.body });
      next(error);
    }
  }

  /**
   * Decrypts data using the specified encryption method
   */
  static async decrypt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { encryptedData, method, privateKey, password } = req.body;

      if (!encryptedData) {
        throw new BadRequestError('Encrypted data is required');
      }

      const decryptedData = await EncryptionService.decrypt(encryptedData, method, privateKey, password);
      
      res.status(200).json({
        success: true,
        decryptedData,
        method,
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      // req.user is expected to be populated by an authentication middleware
      logger.info('Decryption operation completed', {
        userId: req.user?.id,
        method,
        dataSize: Buffer.byteLength(decryptedData),
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Decryption failed', { error: err, data: req.body });
      next(error);
    }
  }

  /**
   * Derives a cryptographic key from a password or other input
   */
  static async deriveKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { input, method, salt, iterations } = req.body;

      if (!input) {
        throw new BadRequestError('Input for key derivation is required');
      }

      const key = await EncryptionService.deriveKey(input, method, salt, iterations);
      
      res.status(200).json({
        success: true,
        key,
        method,
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      // req.user is expected to be populated by an authentication middleware
      logger.info('Key derivation operation completed', {
        userId: req.user?.id,
        method,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Key derivation failed', { error: err, data: req.body });
      next(error);
    }
  }
}