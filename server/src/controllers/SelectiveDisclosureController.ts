import { Request, Response } from 'express';
import { SelectiveDisclosureService } from '../services/SelectiveDisclosureService';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/errors';

export class SelectiveDisclosureController {
  /**
   * Issue a new verifiable claim
   */
  static async issueClaim(req: Request, res: Response): Promise<void> {
    try {
      const { type, issuer, subject, attributes, disclosurePolicy, expirationDate } = req.body;

      if (!type || !issuer || !subject || !attributes) {
        throw new BadRequestError('Type, issuer, subject, and attributes are required');
      }

      const claim = await SelectiveDisclosureService.issueClaim(
        type, issuer, subject, attributes, disclosurePolicy, expirationDate
      );
      
      res.status(200).json({
        success: true,
        claim,
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      logger.info('Claim issued', {
        userId: req.user?.id,
        claimId: claim.id,
        type,
        issuer,
        subject,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Claim issuance failed', { error: err.message, data: req.body });
      throw error;
    }
  }

  /**
   * Create a selective disclosure request
   */
  static async createDisclosureRequest(req: Request, res: Response): Promise<void> {
    try {
      const { verifier, requestedClaims, justification, expiresInSeconds } = req.body;

      if (!verifier || !requestedClaims || !justification) {
        throw new BadRequestError('Verifier, requested claims, and justification are required');
      }

      const request = SelectiveDisclosureService.createDisclosureRequest(
        verifier, requestedClaims, justification, expiresInSeconds
      );
      
      res.status(200).json({
        success: true,
        request,
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      logger.info('Disclosure request created', {
        userId: req.user?.id,
        requestId: request.id,
        verifier,
        claimCount: requestedClaims.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Disclosure request creation failed', { error: err.message, data: req.body });
      throw error;
    }
  }

  /**
   * Respond to a selective disclosure request
   */
  static async respondToRequest(req: Request, res: Response): Promise<void> {
    try {
      const { request, holder, claims } = req.body;

      if (!request || !holder || !claims) {
        throw new BadRequestError('Request, holder, and claims are required');
      }

      const response = await SelectiveDisclosureService.respondToRequest(request, holder, claims);
      
      res.status(200).json({
        success: true,
        response,
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      logger.info('Disclosure response created', {
        userId: req.user?.id,
        requestId: response.requestId,
        holder,
        claimCount: response.disclosedClaims.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Disclosure response creation failed', { error: err.message, data: req.body });
      throw error;
    }
  }

  /**
   * Verify a selective disclosure response
   */
  static async verifyDisclosure(req: Request, res: Response): Promise<void> {
    try {
      const { response, request } = req.body;

      if (!response || !request) {
        throw new BadRequestError('Response and original request are required');
      }

      const isValid = await SelectiveDisclosureService.verifyDisclosureResponse(response, request);
      
      res.status(200).json({
        success: true,
        isValid,
        timestamp: new Date().toISOString()
      });

      // Log usage for analytics
      logger.info('Disclosure verification completed', {
        userId: req.user?.id,
        requestId: response.requestId,
        isValid,
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Disclosure verification failed', { error: err.message, data: req.body });
      throw error;
    }
  }
}