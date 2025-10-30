import { LazyDecryptionService } from './LazyDecryptionService';
import { logger } from '../utils/logger';

export interface ViewportItem {
  id: string;
  encryptedData: any;
  password: string;
  position: number; // Position in the list or grid
  size?: { width: number; height: number }; // For calculating visibility
}

export interface ViewportParams {
  startIndex: number;
  endIndex: number;
  viewportHeight: number;
  itemHeight: number;
  preloadBuffer: number; // How many items to preload beyond viewport
}

export interface ViewportAnalytics {
  totalItems: number;
  visibleItems: number;
  decryptedItems: number;
  cachedItems: number;
  predecryptedItems: number;
  estimatedMemorySaved: number;
}

export class ViewportDecryptionService {
  private static instance: ViewportDecryptionService;
  private lazyDecryptionService: LazyDecryptionService;
  private allItems: ViewportItem[] = [];
  private decryptedItems: Set<string> = new Set();
  private cachedItems: Set<string> = new Set();
  private predecryptedItems: Set<string> = new Set();

  private constructor() {
    this.lazyDecryptionService = LazyDecryptionService.getInstance();
  }

  static getInstance(): ViewportDecryptionService {
    if (!ViewportDecryptionService.instance) {
      ViewportDecryptionService.instance = new ViewportDecryptionService();
    }
    return ViewportDecryptionService.instance;
  }

  /**
   * Set all items for the viewport (typically called once when data is loaded)
   */
  setItems(items: ViewportItem[]): void {
    this.allItems = [...items];
    logger.info('Viewport items updated', { count: items.length });
  }

  /**
   * Get decrypted data for items currently in viewport
   */
  async getDecryptedInViewport(viewportParams: ViewportParams): Promise<Record<string, string>> {
    // Calculate which items are in viewport plus preload buffer
    const start = Math.max(0, viewportParams.startIndex - viewportParams.preloadBuffer);
    const end = Math.min(
      this.allItems.length, 
      viewportParams.endIndex + viewportParams.preloadBuffer
    );

    const itemsToDecrypt = this.allItems.slice(start, end)
      .filter(item => !this.decryptedItems.has(item.id));

    if (itemsToDecrypt.length === 0) {
      // All needed items are already decrypted, return what's in the actual viewport
      const viewportItems = this.allItems.slice(
        viewportParams.startIndex, 
        viewportParams.endIndex
      );
      const result: Record<string, string> = {};
      
      for (const item of viewportItems) {
        // Get from cache or return empty if not yet processed
        const cached = (this.lazyDecryptionService['cache'].get(item.id) as string | undefined) || '';
        result[item.id] = cached;
      }
      
      return result;
    }

    // Decrypt items in viewport range
    const decryptedResults = await this.lazyDecryptionService.decryptInViewport(
      itemsToDecrypt.map(item => ({
        id: item.id,
        data: item.encryptedData,
        password: item.password
      }))
    );

    // Update tracking sets
    itemsToDecrypt.forEach(item => {
      if (decryptedResults[item.id]) {
        this.decryptedItems.add(item.id);
      }
    });

    // Return only the items in actual viewport
    const viewportItems = this.allItems.slice(
      viewportParams.startIndex, 
      viewportParams.endIndex
    );
    const finalResult: Record<string, string> = {};

    viewportItems.forEach(item => {
      finalResult[item.id] = decryptedResults[item.id] || '';
    });

    return finalResult;
  }

  /**
   * Pre-decrypt items that are likely to be viewed soon
   */
  async predecrypForNavigation(viewportParams: ViewportParams): Promise<void> {
    const preloadStart = Math.max(0, viewportParams.endIndex);
    const preloadEnd = Math.min(
      this.allItems.length,
      viewportParams.endIndex + (viewportParams.preloadBuffer * 2)
    );

    const itemsToPredecrypt = this.allItems.slice(preloadStart, preloadEnd)
      .filter(item => !this.predecryptedItems.has(item.id));

    if (itemsToPredecrypt.length > 0) {
      await this.lazyDecryptionService.decryptPreemptively(
        itemsToPredecrypt.map(item => ({
          id: item.id,
          data: item.encryptedData,
          password: item.password
        })),
        { priority: 'low', ttl: 600000 } // 10 minutes for predecrypted
      );

      itemsToPredecrypt.forEach(item => {
        this.predecryptedItems.add(item.id);
      });

      logger.debug('Pre-decrypted future viewport items', {
        count: itemsToPredecrypt.length,
        range: [preloadStart, preloadEnd]
      });
    }
  }

  /**
   * Handle scroll/viewport change and decrypt accordingly
   */
  async handleViewportChange(newViewportParams: ViewportParams): Promise<Record<string, string>> {
    // First get items in new viewport
    const decryptedData = await this.getDecryptedInViewport(newViewportParams);
    
    // Pre-decrypt for future navigation
    await this.predecrypForNavigation(newViewportParams);

    return decryptedData;
  }

  /**
   * Refresh data for a specific item (invalidate cache and re-decrypt)
   */
  async refreshItem(id: string, password: string): Promise<string> {
    const item = this.allItems.find(i => i.id === id);
    if (!item) {
      throw new Error(`Item not found: ${id}`);
    }

    // Invalidate cache
    this.lazyDecryptionService.invalidateCache(id);
    this.decryptedItems.delete(id);

    // Re-decrypt
    const result = await this.lazyDecryptionService.decryptOnDemand(
      item.encryptedData,
      password,
      { priority: 'high' }
    );

    this.decryptedItems.add(id);
    logger.info('Item refreshed', { id });

    return result;
  }

  /**
   * Get analytics for viewport decryption
   */
  getAnalytics(): ViewportAnalytics {
    const totalItems = this.allItems.length;
    const decryptedItemsCount = this.decryptedItems.size;
    const cachedItemsCount = this.cachedItems.size;
    const predecryptedCount = this.predecryptedItems.size;

    return {
      totalItems,
      visibleItems: 0, // Would be calculated based on actual viewport
      decryptedItems: decryptedItemsCount,
      cachedItems: cachedItemsCount,
      predecryptedItems: predecryptedCount,
      estimatedMemorySaved: this.lazyDecryptionService.estimateMemorySaved()
    };
  }

  /**
   * Clear all decryption tracking (for when data changes significantly)
   */
  clearTracking(): void {
    this.decryptedItems.clear();
    this.cachedItems.clear();
    this.predecryptedItems.clear();
    this.allItems = [];
  }

  /**
   * Remove a specific item from tracking
   */
  removeItem(id: string): boolean {
    const wasDecrypted = this.decryptedItems.delete(id);
    const wasCached = this.cachedItems.delete(id);
    const wasPredecrypted = this.predecryptedItems.delete(id);
    
    // Also remove from all items list
    this.allItems = this.allItems.filter(item => item.id !== id);
    
    return wasDecrypted || wasCached || wasPredecrypted;
  }

  /**
   * Get current viewport
   */
  getAllItems(): ViewportItem[] {
    return [...this.allItems];
  }

  /**
   * Update item in viewport
   */
  updateItem(id: string, newItem: ViewportItem): boolean {
    const index = this.allItems.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }

    this.allItems[index] = newItem;
    
    // If item was decrypted, mark it for redecryption
    if (this.decryptedItems.has(id)) {
      this.decryptedItems.delete(id);
      this.lazyDecryptionService.invalidateCache(id);
    }

    return true;
  }
}