import { Request, Response } from 'express';
import { ZkProofService } from '../services/ZkProofService';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/errors';

export class ZkProofController {
  /**
   * Generate a ZK proof for the given circuit and inputs
   */
  static async generateProof(req: Request, res: Response): Promise<void> {
    try {
      const { circuitName, inputs } = req.body;

      if (!circuitName || !inputs) {
        throw new BadRequestError('Circuit name and inputs are required');
      }

      const proof = await ZkProofService.generateProof(circuitName, inputs);
      
      res.status(200).json({
        success: true,
        proof,
        circuitName,
        inputs: Object.keys(inputs), // Only return input field names for privacy
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      logger.info('ZK proof generation completed', {
        userId: req.user?.id,
        circuitName,
        inputCount: Object.keys(inputs).length,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('ZK proof generation failed', { error: err.message, data: req.body });
      throw error;
    }
  }

  /**
   * Verify a ZK proof
   */
  static async verifyProof(req: Request, res: Response): Promise<void> {
    try {
      const { proof, publicSignals, circuitName } = req.body;

      if (!proof || !publicSignals || !circuitName) {
        throw new BadRequestError('Proof, public signals, and circuit name are required');
      }

      const isValid = await ZkProofService.verifyProof(proof, publicSignals, circuitName);
      
      res.status(200).json({
        success: true,
        isValid,
        circuitName,
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      logger.info('ZK proof verification completed', {
        userId: req.user?.id,
        circuitName,
        isValid,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('ZK proof verification failed', { error: err.message, data: req.body });
      throw error;
    }
  }

  /**
   * Generate a range proof (value is within [min, max])
   */
  static async generateRangeProof(req: Request, res: Response): Promise<void> {
    try {
      const { value, min, max } = req.body;

      if (value === undefined || min === undefined || max === undefined) {
        throw new BadRequestError('Value, min, and max are required for range proof');
      }

      const proof = await ZkProofService.generateRangeProof(value, min, max);
      
      res.status(200).json({
        success: true,
        proof,
        type: 'range_proof',
        range: [min, max],
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      logger.info('Range proof generation completed', {
        userId: req.user?.id,
        range: [min, max],
        value,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Range proof generation failed', { error: err.message, data: req.body });
      throw error;
    }
  }

  /**
   * Generate a balance greater than proof
   */
  static async generateBalanceGreaterThanProof(req: Request, res: Response): Promise<void> {
    try {
      const { balance, threshold } = req.body;

      if (balance === undefined || threshold === undefined) {
        throw new BadRequestError('Balance and threshold are required for balance proof');
      }

      const proof = await ZkProofService.generateBalanceGreaterThanProof(balance, threshold);
      
      res.status(200).json({
        success: true,
        proof,
        type: 'balance_greater_than_proof',
        threshold,
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      logger.info('Balance greater than proof generation completed', {
        userId: req.user?.id,
        threshold,
        balance,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Balance greater than proof generation failed', { error: err.message, data: req.body });
      throw error;
    }
  }
}