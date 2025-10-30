import { logger } from '../utils/logger';

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

/**
 * A simple in-memory cache with TTL (Time To Live) support
 */
class SimpleCache<T = any> { // Removed 'export'
  private cache: Map<string, CacheEntry<T>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Creates a new cache instance
   * @param cleanupIntervalMs How often to clean up expired entries (default: 60000ms/1min)
   */
  constructor(cleanupIntervalMs: number = 60000) {
    this.startCleanupInterval(cleanupIntervalMs);
  }

  /**
   * Sets a value in the cache with TTL
   */
  set(key: string, value: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Gets a value from the cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Checks if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Deletes a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Starts the cleanup interval to remove expired entries
   */
  private startCleanupInterval(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, intervalMs);
  }

  /**
   * Stops the cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * Memoization decorator function
 */
function memoize<T extends (...args: any[]) => any>( // Removed 'export'
  fn: T,
  keyFn?: (...args: Parameters<T>) => string,
  ttl: number = 300000 // 5 minutes default
): T {
  const cache = new SimpleCache();
  
  // Generate cache key from arguments if no key function provided
  const defaultKeyFn = (...args: Parameters<T>): string => {
    return JSON.stringify(args);
  };
  
  const effectiveKeyFn = keyFn || defaultKeyFn;
  
  return function(this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> { // Added 'this' type
    const key = effectiveKeyFn(...args);
    const cached = cache.get(key);
    
    if (cached !== null) {
      return cached as ReturnType<T>; // Type assertion for cached value
    }
    
    const result = fn.apply(this, args);
    
    // Handle promises
    if (result instanceof Promise) {
      return result.then(value => {
        cache.set(key, value, ttl);
        return value;
      }) as ReturnType<T>; // Type assertion for promise return
    }
    
    cache.set(key, result, ttl);
    return result as ReturnType<T>; // Type assertion for direct return
  } as T;
}

/**
 * Encryption cache service that manages encryption/decryption results
 */
class EncryptionCache { // Removed 'export'
  private readonly cache: SimpleCache;
  private static instance: EncryptionCache | null = null;
  
  private constructor() {
    // 10 minutes TTL for encryption results
    this.cache = new SimpleCache(600000);
  }
  
  static getInstance(): EncryptionCache {
    if (!EncryptionCache.instance) {
      EncryptionCache.instance = new EncryptionCache();
    }
    return EncryptionCache.instance;
  }
  
  /**
   * Cache an encryption result
   */
  cacheEncryption(input: string, password: string, result: any): void {
    const key = this.generateEncryptionKey(input, password);
    this.cache.set(key, result);
    logger.debug('Cached encryption result', { key });
  }
  
  /**
   * Get cached encryption result
   */
  getCachedEncryption(input: string, password: string): any | null {
    const key = this.generateEncryptionKey(input, password);
    const result = this.cache.get(key);
    
    if (result) {
      logger.debug('Retrieved cached encryption result', { key });
    }
    
    return result;
  }
  
  /**
   * Cache a decryption result
   */
  cacheDecryption(encryptedData: any, password: string, result: string): void {
    const key = this.generateDecryptionKey(encryptedData, password);
    this.cache.set(key, result);
    logger.debug('Cached decryption result', { key });
  }
  
  /**
   * Get cached decryption result
   */
  getCachedDecryption(encryptedData: any, password: string): string | null {
    const key = this.generateDecryptionKey(encryptedData, password);
    const result = this.cache.get(key);
    
    if (result) {
      logger.debug('Retrieved cached decryption result', { key });
    }
    
    return result;
  }
  
  /**
   * Generate a key for encryption cache
   */
  private generateEncryptionKey(input: string, password: string): string {
    // Create a deterministic key based on input and password (without revealing password)
    const inputHash = this.simpleHash(input);
    const passwordHash = this.simpleHash(password);
    return `enc_${inputHash}_${passwordHash}`;
  }
  
  /**
   * Generate a key for decryption cache
   */
  private generateDecryptionKey(encryptedData: any, password: string): string {
    const dataHash = this.simpleHash(JSON.stringify(encryptedData));
    const passwordHash = this.simpleHash(password);
    return `dec_${dataHash}_${passwordHash}`;
  }
  
  /**
   * Simple hash function (not cryptographically secure, just for key generation)
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
  
  /**
   * Clear the encryption cache
   */
  clear(): void {
    this.cache.clear();
  }
}
export { SimpleCache, memoize, EncryptionCache };