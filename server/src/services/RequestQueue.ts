import { logger } from '../utils/logger';

export interface QueueItem {
  id: string;
  operation: string;  // 'encrypt', 'decrypt', 'zk-proof', etc.
  data: any;
  priority: number;   // Higher number = higher priority
  userId?: string;
  timestamp: number;
  timeout?: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

export interface QueueStats {
  totalItems: number;
  processingItems: number;
  waitingItems: number;
  completedItems: number;
  failedItems: number;
  avgWaitTime: number;
  avgProcessingTime: number;
}

export class RequestQueue {
  private static instance: RequestQueue;
  private queue: QueueItem[] = [];
  private processing: Set<string> = new Set();
  private completedItems: number = 0;
  private failedItems: number = 0;
  private waitTimes: number[] = [];
  private processingTimes: number[] = [];
  private maxConcurrent: number;
  private isProcessing: boolean = false;

  private constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  static getInstance(maxConcurrent: number = 5): RequestQueue {
    if (!RequestQueue.instance) {
      RequestQueue.instance = new RequestQueue(maxConcurrent);
    }
    return RequestQueue.instance;
  }

  /**
   * Add an item to the queue
   */
  async enqueue(
    operation: string,
    data: any,
    priority: number = 1,
    userId?: string,
    timeout?: number
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const item: QueueItem = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operation,
        data,
        priority,
        userId,
        timestamp: Date.now(),
        timeout,
        resolve,
        reject
      };

      // Add to queue and sort by priority (highest first)
      this.queue.push(item);
      this.sortByPriority();

      logger.debug('Item added to queue', { 
        id: item.id, 
        operation, 
        priority,
        queueSize: this.queue.length 
      });

      // Start processing if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process items in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || this.processing.size >= this.maxConcurrent) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0 && this.processing.size < this.maxConcurrent) {
        const item = this.queue.shift();
        if (!item) continue;

        // Mark as processing
        this.processing.add(item.id);

        // Process the item asynchronously
        this.processItem(item);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single item
   */
  private async processItem(item: QueueItem): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Create timeout promise
      let timeoutPromise: Promise<never> | null = null;
      if (item.timeout) {
        timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Operation timeout after ${item.timeout}ms`));
          }, item.timeout);
        });
      }

      // Execute the operation
      const operationPromise = this.executeOperation(item.operation, item.data);
      
      // Race the operation against the timeout
      const result = timeoutPromise 
        ? await Promise.race([operationPromise, timeoutPromise])
        : await operationPromise;

      // Record processing time
      const processingTime = Date.now() - startTime;
      this.processingTimes.push(processingTime);
      
      // Remove from processing set
      this.processing.delete(item.id);

      // Resolve the original promise
      item.resolve(result);

      // Update stats
      this.completedItems++;
      
      logger.info('Queue item processed successfully', {
        id: item.id,
        operation: item.operation,
        processingTime
      });
    } catch (error: unknown) {
      const err = error as Error;
      // Record processing time even for failures
      const processingTime = Date.now() - startTime;
      this.processingTimes.push(processingTime);
      
      // Remove from processing set
      this.processing.delete(item.id);

      // Reject the original promise
      item.reject(error);

      // Update stats
      this.failedItems++;
      
      logger.error('Queue item processing failed', {
        id: item.id,
        operation: item.operation,
        error: err.message,
        processingTime
      });
    } finally {
      // Record wait time
      this.waitTimes.push(Date.now() - item.timestamp);
      
      // Continue processing the queue
      setImmediate(() => {
        this.processQueue();
      });
    }
  }

  /**
   * Execute the actual operation based on type
   */
  private async executeOperation(operation: string, data: any): Promise<any> {
    // In a real implementation, this would call the appropriate service
    // For now, we'll simulate the operations
    switch (operation) {
      case 'encrypt':
        // Simulate encryption
        await this.delay(Math.random() * 1000 + 500); // 0.5-1.5 seconds
        return {
          encrypted: `encrypted_${data.input || data}`,
          method: data.method || 'aes256'
        };
      case 'decrypt':
        // Simulate decryption
        await this.delay(Math.random() * 800 + 300); // 0.3-1.1 seconds
        return `decrypted_${data.encryptedData || data}`;
      case 'zk-proof':
        // Simulate ZK proof generation
        await this.delay(Math.random() * 2000 + 1000); // 1-3 seconds
        return {
          proof: `zk-proof_${data.type || 'generic'}`,
          publicSignals: data.inputs || []
        };
      default:
        // For other operations, simulate processing time
        await this.delay(500);
        return { result: `processed_${operation}`, data };
    }
  }

  /**
   * Sort the queue by priority (highest first)
   */
  private sortByPriority(): void {
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const totalWaitTime = this.waitTimes.reduce((sum, time) => sum + time, 0);
    const avgWaitTime = this.waitTimes.length > 0 ? totalWaitTime / this.waitTimes.length : 0;
    
    const totalProcessingTime = this.processingTimes.reduce((sum, time) => sum + time, 0);
    const avgProcessingTime = this.processingTimes.length > 0 ? totalProcessingTime / this.processingTimes.length : 0;

    return {
      totalItems: this.queue.length + this.processing.size,
      processingItems: this.processing.size,
      waitingItems: this.queue.length,
      completedItems: this.completedItems,
      failedItems: this.failedItems,
      avgWaitTime,
      avgProcessingTime
    };
  }

  /**
   * Cancel an item in the queue
   */
  cancel(id: string): boolean {
    // Remove from processing if currently processing
    if (this.processing.has(id)) {
      // In a real implementation, you'd need to cancel the ongoing operation
      // For now, we'll just remove from the set
      this.processing.delete(id);
      return true;
    }

    // Remove from queue if waiting
    const index = this.queue.findIndex(item => item.id === id);
    if (index !== -1) {
      const item = this.queue[index];
      item.reject(new Error('Operation cancelled'));
      this.queue.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Pause the queue processing
   */
  pause(): void {
    this.isProcessing = false;
  }

  /**
   * Resume the queue processing
   */
  resume(): void {
    if (!this.isProcessing) {
      setImmediate(() => {
        this.processQueue();
      });
    }
  }

  /**
   * Clear the entire queue
   */
  clear(): void {
    // Reject all waiting items
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        item.reject(new Error('Queue cleared'));
      }
    }
    
    // Clear wait times and processing times
    this.waitTimes = [];
    this.processingTimes = [];
    this.completedItems = 0;
    this.failedItems = 0;
  }

  /**
   * Helper method to simulate async delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}