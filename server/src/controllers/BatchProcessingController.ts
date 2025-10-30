import { Request, Response } from 'express';
import { EncryptionService } from '../services/EncryptionService';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/errors';

export interface BatchOperation {
  id: string;
  operation: 'encrypt' | 'decrypt';
  data: any;
  password: string;
  options?: any;
}

export interface BatchResult {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
  timestamp: number;
}

export interface BatchRequest {
  operations: BatchOperation[];
  options?: {
    maxConcurrent?: number;
    timeout?: number;
  };
}

export interface BatchResponse {
  success: boolean;
  results: BatchResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    processingTime: number;
  };
}

export class BatchProcessingController {
  private static readonly DEFAULT_MAX_CONCURRENT = 10;
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds

  /**
   * Process multiple encryption/decryption operations in a batch
   */
  static async processBatch(req: Request, res: Response): Promise<void> {
    try {
      const { operations, options = {} }: BatchRequest = req.body;

      if (!operations || !Array.isArray(operations) || operations.length === 0) {
        throw new BadRequestError('Batch operations array is required and cannot be empty');
      }

      if (operations.length > 100) {
        throw new BadRequestError('Batch size cannot exceed 100 operations');
      }

      const start = Date.now();
      
      // Process operations in parallel with concurrency control
      const results = await BatchProcessingController.processOperationsInBatches(
        operations,
        options.maxConcurrent || BatchProcessingController.DEFAULT_MAX_CONCURRENT,
        options.timeout || BatchProcessingController.DEFAULT_TIMEOUT
      );

      const processingTime = Date.now() - start;

      // Calculate summary
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      const response: BatchResponse = {
        success: true,
        results,
        summary: {
          total: operations.length,
          successful,
          failed,
          processingTime
        }
      };

      res.status(200).json(response);

      logger.info('Batch processing completed', {
        userId: req.user?.id,
        batchSize: operations.length,
        successful,
        failed,
        processingTime
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Batch processing failed', { error: err.message, data: req.body });
      throw error;
    }
  }

  /**
   * Process operations in parallel with concurrency control
   */
  private static async processOperationsInBatches(
    operations: BatchOperation[],
    maxConcurrent: number,
    timeout: number
  ): Promise<BatchResult[]> {
    const results: BatchResult[] = [];

    // Process operations in chunks to control concurrency
    for (let i = 0; i < operations.length; i += maxConcurrent) {
      const chunk = operations.slice(i, i + maxConcurrent);
      
      // Process each chunk in parallel
      const chunkPromises = chunk.map(async (op) => {
        try {
          let result;
          
          // Create a timeout promise
          const timeoutPromise = new Promise<BatchResult>((_, reject) => {
            setTimeout(() => reject(new Error('Operation timeout')), timeout);
          });
          
          // Execute the operation with timeout
          const operationPromise = (async () => {
            if (op.operation === 'encrypt') {
              result = await EncryptionService.encrypt(
                op.data,
                op.password,
                op.options
              );
            } else if (op.operation === 'decrypt') {
              result = await EncryptionService.decrypt(
                op.data,
                op.password,
                op.options
              );
            } else {
              throw new Error(`Unsupported operation: ${op.operation}`);
            }
            
            return {
              id: op.id,
              success: true,
              result,
              timestamp: Date.now()
            };
          })();
          
          // Race the operation against the timeout
          return Promise.race([operationPromise, timeoutPromise]);
        } catch (error: unknown) {
          const err = error as Error;
          return {
            id: op.id,
            success: false,
            error: err.message,
            timestamp: Date.now()
          };
        }
      });
      
      // Wait for this chunk to complete before starting the next
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * Process multiple operations with priority queue
   */
  static async processBatchWithPriority(req: Request, res: Response): Promise<void> {
    try {
      const { operations, options = {} }: BatchRequest = req.body;

      if (!operations || !Array.isArray(operations) || operations.length === 0) {
        throw new BadRequestError('Batch operations array is required and cannot be empty');
      }

      const start = Date.now();
      
      // Sort operations by priority (high priority first if priority is specified)
      const prioritizedOperations = [...operations].sort((a, b) => {
        const priorityA = a.options?.priority || 0;
        const priorityB = b.options?.priority || 0;
        return priorityB - priorityA; // Higher priority first
      });
      
      // Process operations with priority consideration
      const results = await BatchProcessingController.processOperationsInBatches(
        prioritizedOperations,
        options.maxConcurrent || BatchProcessingController.DEFAULT_MAX_CONCURRENT,
        options.timeout || BatchProcessingController.DEFAULT_TIMEOUT
      );

      const processingTime = Date.now() - start;

      // Calculate summary
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;

      const response: BatchResponse = {
        success: true,
        results,
        summary: {
          total: operations.length,
          successful,
          failed,
          processingTime
        }
      };

      res.status(200).json(response);

      logger.info('Priority batch processing completed', {
        userId: req.user?.id,
        batchSize: operations.length,
        successful,
        failed,
        processingTime
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Priority batch processing failed', { error: err.message, data: req.body });
      throw error;
    }
  }
}