import { EncryptionService } from './EncryptionService';
import { logger } from '../utils/logger';
import { SimpleCache } from './cache';

export interface LazyDecryptionOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in MB
  priority?: 'low' | 'medium' | 'high'; // Priority level for decryption
  predecryptionThreshold?: number; // How many items to pre-decrypt
}

export interface DecryptionTask {
  id: string;
  encryptedData: any;
  password: string;
  options: LazyDecryptionOptions;
  resolve: (value: string) => void;
  reject: (reason: any) => void;
  priority: number;
  timestamp: number;
  viewStatus: 'pending' | 'decrypted' | 'cached' | 'preemptive';
}

export interface DecryptionAnalytics {
  totalDecryptions: number;
  cachedDecryptions: number;
  onDemandDecryptions: number;
  predecrypted: number;
  memorySaved: number; // MB
  avgDecryptionTime: number; // ms
  lastUpdated: Date;
}

export class LazyDecryptionService {
  private static instance: LazyDecryptionService;
  private cache: SimpleCache;
  private decryptionQueue: DecryptionTask[] = [];
  private processingIds: Set<string> = new Set();
  private maxConcurrent: number = 5;
  private isProcessing: boolean = false;
  private analytics: DecryptionAnalytics = {
    totalDecryptions: 0,
    cachedDecryptions: 0,
    onDemandDecryptions: 0,
    predecrypted: 0,
    memorySaved: 0,
    avgDecryptionTime: 0,
    lastUpdated: new Date()
  };
  private decryptionTimes: number[] = [];

  private constructor() {
    // Initialize cache with 100MB max size and 30-minute TTL as default
    this.cache = new SimpleCache(1800000); // 30 minutes
  }

  static getInstance(): LazyDecryptionService {
    if (!LazyDecryptionService.instance) {
      LazyDecryptionService.instance = new LazyDecryptionService();
    }
    return LazyDecryptionService.instance;
  }

  /**
   * Request decryption of data on-demand
   */
  async decryptOnDemand(
    encryptedData: any,
    password: string,
    options: LazyDecryptionOptions = {}
  ): Promise<string> {
    const taskId = this.generateTaskId(encryptedData);

    // Check cache first
    const cachedResult: string | undefined = this.cache.get(taskId);
    if (cachedResult) {
      this.analytics.cachedDecryptions++;
      this.analytics.totalDecryptions++;
      logger.debug('Retrieved decrypted data from cache', { taskId });
      return cachedResult;
    }

    // If not in cache, add to queue
    return new Promise<string>((resolve, reject) => {
      const task: DecryptionTask = {
        id: taskId,
        encryptedData,
        password,
        options: { ttl: 1800000, maxSize: 100, priority: 'high', ...options },
        resolve,
        reject,
        priority: this.getPriorityValue(options.priority || 'medium'),
        timestamp: Date.now(),
        viewStatus: 'pending'
      };

      // Add to queue and sort by priority
      this.decryptionQueue.push(task);
      this.sortQueueByPriority();

      logger.debug('Added to decryption queue', { 
        taskId, 
        queueSize: this.decryptionQueue.length 
      });

      // Start processing if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Request decryption for data in viewport only
   */
  async decryptInViewport(
    encryptedDataList: Array<{ id: string; data: any; password: string }>,
    options: LazyDecryptionOptions = {}
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    // Process in batches to manage memory
    const batchSize = 10;
    for (let i = 0; i < encryptedDataList.length; i += batchSize) {
      const batch = encryptedDataList.slice(i, i + batchSize);
      const batchPromises = batch.map(item => 
        this.decryptOnDemand(item.data, item.password, { ...options, priority: 'high' })
          .then(result => ({ id: item.id, result }))
      );

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ id, result }) => {
        results[id] = result;
      });
    }

    return results;
  }

  /**
   * Preemptively decrypt data that might be needed soon
   */
  async decryptPreemptively(
    encryptedDataList: Array<{ id: string; data: any; password: string }>,
    options: LazyDecryptionOptions = {}
  ): Promise<void> {
    // Process in background, don't wait for completion
    encryptedDataList.forEach(item => {
      this.decryptOnDemand(item.data, item.password, { 
        ...options, 
        priority: 'low',
        ttl: options.ttl || 900000 // 15 minutes for predecrypted data
      }).then(result => {
        this.analytics.predecrypted++;
        logger.debug('Preemptively decrypted data', { id: item.id });
      }).catch((error: unknown) => {
        const err = error as Error;
        logger.error('Preemptive decryption failed', { id: item.id, error: err.message });
      });
    });
  }

  /**
   * Process items in the decryption queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.decryptionQueue.length === 0 || this.processingIds.size >= this.maxConcurrent) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.decryptionQueue.length > 0 && this.processingIds.size < this.maxConcurrent) {
        const task = this.decryptionQueue.shift();
        if (!task) continue;

        // Add to processing set
        this.processingIds.add(task.id);

        // Process the decryption
        this.processDecryptionTask(task);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single decryption task
   */
  private async processDecryptionTask(task: DecryptionTask): Promise<void> {
    const startTime = Date.now();

    try {
      // Execute the decryption
      const result = await EncryptionService.decrypt(
        task.encryptedData,
        'aes256',
        undefined,
        task.password
      );

      // Cache the result with TTL
      this.cache.set(task.id, result, task.options.ttl);

      // Mark as decrypted
      task.viewStatus = 'decrypted';

      // Record analytics
      this.analytics.onDemandDecryptions++;
      this.analytics.totalDecryptions++;
      const decryptionTime = Date.now() - startTime;
      this.decryptionTimes.push(decryptionTime);
      this.analytics.avgDecryptionTime = 
        this.decryptionTimes.reduce((sum, t) => sum + t, 0) / this.decryptionTimes.length;

      // Resolve the original promise
      task.resolve(result);

      logger.debug('Successfully decrypted data', {
        taskId: task.id,
        decryptionTime,
        cacheTtl: task.options.ttl
      });
    } catch (error: unknown) {
      const err = error as Error;
      // Mark as failed and reject the original promise
      task.viewStatus = 'pending'; // Keep as pending so it might be retried
      task.reject(error);

      logger.error('Decryption failed', {
        taskId: task.id,
        error: err.message
      });
    } finally {
      // Remove from processing set
      this.processingIds.delete(task.id);

      // Update analytics timestamp
      this.analytics.lastUpdated = new Date();

      // Continue processing queue
      setImmediate(() => this.processQueue());
    }
  }

  /**
   * Sort the queue by priority (highest first)
   */
  private sortQueueByPriority(): void {
    this.decryptionQueue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get numeric value for priority
   */
  private getPriorityValue(priority: 'low' | 'medium' | 'high'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  }

  /**
   * Generate a unique task ID
   */
  private generateTaskId(encryptedData: any): string {
    // Create a deterministic ID based on the encrypted data
    const dataStr = JSON.stringify(encryptedData);
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      const char = dataStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `dec_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Get current analytics
   */
  getAnalytics(): DecryptionAnalytics {
    return { ...this.analytics };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Invalidate specific cached item
   */
  invalidateCache(id: string): boolean {
    return this.cache.delete(id);
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { pending: number; processing: number; completed: number } {
    return {
      pending: this.decryptionQueue.length,
      processing: this.processingIds.size,
      completed: this.analytics.totalDecryptions
    };
  }

  /**
   * Estimate memory saved by lazy decryption
   */
  estimateMemorySaved(): number {
    // This is a simplified estimate based on the fact that we're only decrypting
    // data when needed rather than all at once
    // In a real implementation, this would track actual memory usage
    return this.analytics.predecrypted * 0.05; // Assuming 50KB saved per predecrypted item
  }
}