import { Request, Response } from 'express';
import { ComprehensivePrivacyService } from '../services/ComprehensivePrivacyService';
import { logger } from '../utils/logger';

export class PrivacyController {
  private privacyService: ComprehensivePrivacyService;

  constructor() {
    // Initialize with default configuration
    this.privacyService = new ComprehensivePrivacyService({
      solana: {
        clusterUrl: process.env.SOLANA_CLUSTER_URL || 'https://api.devnet.solana.com',
        programId: process.env.SOLANA_PROGRAM_ID
      },
      mpc: {
        threshold: 2,
        totalParties: 3
      },
      fhe: {
        securityLevel: 128
      },
      tee: {
        enclaveId: process.env.TEE_ENCLAVE_ID || 'default-enclave',
        verificationKey: process.env.TEE_VERIFICATION_KEY || 'default-key'
      }
    });
  }

  /**
   * Initialize privacy services
   */
  async initialize(req: Request, res: Response): Promise<void> {
    try {
      const success = await this.privacyService.initialize();
      
      res.status(200).json({
        success,
        message: success ? 'Privacy services initialized successfully' : 'Failed to initialize privacy services'
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Privacy service initialization failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Perform Multi-Party Computation
   */
  async performMPC(req: Request, res: Response): Promise<void> {
    try {
      const { values, operation } = req.body;

      if (!Array.isArray(values) || values.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Values array is required'
        });
        return;
      }

      // For MPC operations we need to store the values and generate shares
      const bigIntValues = values.map(v => BigInt(v));
      const operationId = `mpc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const mpcService = this.privacyService.getMPCService();
      // Generate shares for the first value as an example
      const shares = mpcService.generateShares(bigIntValues[0], operationId);

      // For a real implementation, we'd coordinate between multiple parties
      // Here we'll just return the shares
      res.status(200).json({
        success: true,
        result: {
          shares,
          operation,
          value: bigIntValues[0].toString()
        }
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('MPC operation failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Perform Fully Homomorphic Encryption operation
   */
  async performFHE(req: Request, res: Response): Promise<void> {
    try {
      const { operation, encryptedValue1, encryptedValue2 } = req.body;

      if (!operation || !encryptedValue1) {
        res.status(400).json({
          success: false,
          error: 'Operation and encryptedValue1 are required'
        });
        return;
      }

      const fheService = this.privacyService.getFHEService();

      let result;
      switch (operation) {
        case '+':
        case 'add':
          if (!encryptedValue2) {
            res.status(400).json({
              success: false,
              error: 'encryptedValue2 required for addition'
            });
            return;
          }
          result = await fheService.add(encryptedValue1, encryptedValue2);
          break;

        case '*':
        case 'multiply':
          if (!encryptedValue2) {
            res.status(400).json({
              success: false,
              error: 'encryptedValue2 required for multiplication'
            });
            return;
          }
          result = await fheService.multiply(encryptedValue1, encryptedValue2);
          break;

        case 'encrypt':
          // If operation is encrypt, encrypt the provided value
          const valueToEncrypt = BigInt(encryptedValue1.toString());
          result = fheService.encrypt(valueToEncrypt);
          break;

        default:
          res.status(400).json({
            success: false,
            error: `Unsupported FHE operation: ${operation}`
          });
          return;
      }

      res.status(200).json({
        success: true,
        result
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('FHE operation failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Perform TEE-secured operation
   */
  async performTEE(req: Request, res: Response): Promise<void> {
    try {
      const { operation, data } = req.body;

      if (!operation || data === undefined) {
        res.status(400).json({
          success: false,
          error: 'Operation and data are required'
        });
        return;
      }

      const teeService = this.privacyService.getTEEIntegration();

      // Execute operation in TEE
      const teeResult = await teeService.executeOperation({
        operation: operation as 'encrypt' | 'decrypt' | 'compute' | 'verify',
        data: new Uint8Array(Buffer.from(JSON.stringify(data))),
        metadata: { operation, timestamp: Date.now() }
      });

      res.status(200).json({
        success: teeResult.success,
        result: teeResult.output ? new TextDecoder().decode(teeResult.output) : teeResult.output,
        attestation: teeResult.attestation,
        verification: teeResult.verification
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('TEE operation failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Store data with privacy protection
   */
  async storePrivate(req: Request, res: Response): Promise<void> {
    try {
      const { data, key } = req.body;

      if (!data || !key) {
        res.status(400).json({
          success: false,
          error: 'Data and key are required'
        });
        return;
      }

      const success = await this.privacyService.storePrivately(data, key);

      res.status(200).json({
        success,
        message: success ? 'Data stored privately' : 'Failed to store data privately'
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Private storage failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Retrieve data with privacy preservation
   */
  async retrievePrivate(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({
          success: false,
          error: 'Key is required'
        });
        return;
      }

      const data = await this.privacyService.retrievePrivately(key);

      res.status(200).json({
        success: data !== null,
        result: data,
        message: data !== null ? 'Data retrieved successfully' : 'Data not found'
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Private retrieval failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Execute a comprehensive privacy operation
   */
  async executePrivacyOperation(req: Request, res: Response): Promise<void> {
    try {
      const { data, operation, options } = req.body;

      if (!data || !operation) {
        res.status(400).json({
          success: false,
          error: 'Data and operation are required'
        });
        return;
      }

      const result = await this.privacyService.executePrivacyOperation({
        data,
        operation,
        options
      });

      res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Privacy operation failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }

  /**
   * Get privacy service health
   */
  async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.privacyService.getPrivacyHealth();

      res.status(200).json({
        success: true,
        health
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Health check failed', { error: err.message });
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  }
}