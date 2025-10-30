// server/src/services/ProgressiveDataService.ts
import { logger } from '../utils/logger';

export interface DataChunk {
  id: string;
  data: any;
  index: number;
  isEncrypted: boolean;
  encryptionMetadata?: any;
}

export interface ProgressiveLoadParams {
  start: number;
  end: number;
  chunkSize?: number;
  decrypt?: boolean;
  password?: string;
}

export interface ProgressiveLoadResult {
  chunks: DataChunk[];
  totalChunks: number;
  loadedChunks: number;
  isComplete: boolean;
}

export class ProgressiveDataService {
  private static instance: ProgressiveDataService;
  private dataStore: Map<string, any[]> = new Map();
  private defaultChunkSize: number = 100; // items per chunk

  private constructor() {}

  static getInstance(): ProgressiveDataService {
    if (!ProgressiveDataService.instance) {
      ProgressiveDataService.instance = new ProgressiveDataService();
    }
    return ProgressiveDataService.instance;
  }

  /**
   * Register a dataset for progressive loading
   */
  registerDataset(id: string, data: any[]): void {
    this.dataStore.set(id, data);
    logger.info('Dataset registered for progressive loading', { 
      id, 
      size: data.length 
    });
  }

  /**
   * Load data progressively in chunks
   */
  async loadDataProgressively(
    datasetId: string,
    params: ProgressiveLoadParams
  ): Promise<ProgressiveLoadResult> {
    const dataset = this.dataStore.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }

    const chunkSize = params.chunkSize || this.defaultChunkSize;
    const startIndex = params.start;
    const endIndex = Math.min(params.end, dataset.length);
    
    // Calculate total chunks for this dataset
    const totalChunks = Math.ceil(dataset.length / chunkSize);
    const startChunkIndex = Math.floor(startIndex / chunkSize);
    const endChunkIndex = Math.floor(endIndex / chunkSize);
    
    const chunks: DataChunk[] = [];
    
    // Load the requested range
    for (let i = startIndex; i < endIndex; i++) {
      let item = dataset[i];
      let isEncrypted = false;
      let encryptionMetadata = undefined;
      
      // If decryption is requested and item is encrypted, decrypt it
      if (params.decrypt && params.password && this.isEncrypted(item)) {
        try {
          // In a real implementation, this would decrypt the item
          // For now, we'll just simulate decryption
          item = this.decryptItem(item, params.password);
          isEncrypted = true;
          encryptionMetadata = { method: 'aes256', encryptedAt: new Date().toISOString() };
        } catch (error: unknown) {
          const err = error as Error;
          logger.error('Failed to decrypt item during progressive loading', { 
            error: err.message, 
            itemIndex: i 
          });
        }
      } else if (this.isEncrypted(item)) {
        isEncrypted = true;
        encryptionMetadata = { method: 'aes256', encryptedAt: new Date().toISOString() };
      }
      
      chunks.push({
        id: `${datasetId}_chunk_${Math.floor(i / chunkSize)}_item_${i % chunkSize}`,
        data: item,
        index: i,
        isEncrypted,
        encryptionMetadata
      });
    }
    
    const loadedChunks = endChunkIndex - startChunkIndex + 1;
    
    return {
      chunks,
      totalChunks,
      loadedChunks,
      isComplete: endIndex === dataset.length
    };
  }

  /**
   * Check if an item is encrypted
   */
  private isEncrypted(item: any): boolean {
    // Check if the item has common encrypted data markers
    return (
      typeof item === 'object' &&
      item !== null &&
      (item.hasOwnProperty('data') && 
       item.hasOwnProperty('iv') && 
       item.hasOwnProperty('salt') &&
       item.hasOwnProperty('method'))
    );
  }

  /**
   * Decrypt an item (simulated)
   */
  private decryptItem(item: any, password: string): any {
    // In a real implementation, this would perform actual decryption
    // For demonstration, we'll just return a modified version
    if (this.isEncrypted(item)) {
      return {
        decrypted: item.data,
        original: item
      };
    }
    return item;
  }

  /**
   * Stream data progressively using async generator
   */
  async * streamDataProgressively(
    datasetId: string,
    params: ProgressiveLoadParams
  ): AsyncGenerator<DataChunk, void, unknown> {
    const dataset = this.dataStore.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }

    const chunkSize = params.chunkSize || this.defaultChunkSize;
    
    for (let i = params.start; i < Math.min(params.end, dataset.length); i++) {
      let item = dataset[i];
      let isEncrypted = false;
      let encryptionMetadata = undefined;
      
      // If decryption is requested and item is encrypted, decrypt it
      if (params.decrypt && params.password && this.isEncrypted(item)) {
        try {
          item = this.decryptItem(item, params.password);
          isEncrypted = true;
          encryptionMetadata = { method: 'aes256', encryptedAt: new Date().toISOString() };
        } catch (error: unknown) {
          const err = error as Error;
          logger.error('Failed to decrypt item during streaming', { 
            error: err.message, 
            itemIndex: i 
          });
        }
      } else if (this.isEncrypted(item)) {
        isEncrypted = true;
        encryptionMetadata = { method: 'aes256', encryptedAt: new Date().toISOString() };
      }
      
      const chunk: DataChunk = {
        id: `${datasetId}_stream_item_${i}`,
        data: item,
        index: i,
        isEncrypted,
        encryptionMetadata
      };
      
      yield chunk;
    }
  }

  /**
   * Preload data with predictive loading
   */
  async predictiveLoad(
    datasetId: string,
    currentIndex: number,
    direction: 'forward' | 'backward' = 'forward',
    preloadCount: number = 50
  ): Promise<DataChunk[]> {
    const dataset = this.dataStore.get(datasetId);
    if (!dataset) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }

    let startIndex: number;
    let endIndex: number;

    if (direction === 'forward') {
      startIndex = currentIndex + 1;
      endIndex = Math.min(currentIndex + preloadCount + 1, dataset.length);
    } else {
      startIndex = Math.max(currentIndex - preloadCount, 0);
      endIndex = currentIndex;
    }

    // Load predicted chunks
    const chunks: DataChunk[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      chunks.push({
        id: `${datasetId}_predicted_${i}`,
        data: dataset[i],
        index: i,
        isEncrypted: this.isEncrypted(dataset[i])
      });
    }

    logger.debug('Predictive loading completed', {
      datasetId,
      direction,
      loadedCount: chunks.length,
      startIndex,
      endIndex
    });

    return chunks;
  }

  /**
   * Get metadata about a dataset
   */
  getDatasetMetadata(datasetId: string): { 
    totalItems: number; 
    chunkSize: number; 
    totalChunks: number 
  } | null {
    const dataset = this.dataStore.get(datasetId);
    if (!dataset) {
      return null;
    }

    const totalItems = dataset.length;
    const totalChunks = Math.ceil(totalItems / this.defaultChunkSize);

    return {
      totalItems,
      chunkSize: this.defaultChunkSize,
      totalChunks
    };
  }

  /**
   * Clear a dataset
   */
  clearDataset(datasetId: string): boolean {
    return this.dataStore.delete(datasetId);
  }

  /**
   * Clear all datasets
   */
  clearAll(): void {
    this.dataStore.clear();
  }
}