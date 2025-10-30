import { ArciumPrivacyClient } from '../client';
import { EncryptOptions, DecryptOptions, EncryptionResult } from '../types';
import { ArciumPrivacyError } from '../errors';
import { EncryptionCache, SimpleCache } from './cache';

/**
 * Service for handling encryption and decryption operations
 */
export class EncryptionService {
  private encryptionCache: EncryptionCache;
  
  constructor(private client: ArciumPrivacyClient) {
    this.encryptionCache = EncryptionCache.getInstance();
  }

  /**
   * Encrypts data using the Arcium Privacy API
   * @param options - Encryption options including data, key, and method
   * @returns The encrypted data
   */
  async encrypt(options: EncryptOptions): Promise<EncryptionResult> {
    try {
      // Convert Buffer to string if needed (assuming options.data can be Buffer)
      const dataStr = Buffer.isBuffer(options.data) ? options.data.toString('utf8') : options.data;
      
      // Check cache first
      const cachedResult = this.encryptionCache.getCachedEncryption(dataStr, options.key);
      if (cachedResult) {
        return cachedResult;
      }
      
      const response = await this.client.request('/encrypt', {
        method: 'POST',
        body: JSON.stringify({
          data: dataStr,
          method: options.method || 'aes256',
          password: options.key // Assuming 'key' is used as 'password' in the API
        })
      });

      if (!response.success || !response.data) {
        throw new ArciumPrivacyError(
          response.error || 'Encryption failed',
          undefined,
          'ENCRYPTION_FAILED'
        );
      }

      // Cache the result for future use
      this.encryptionCache.cacheEncryption(dataStr, options.key, response.data);
      
      return response.data;
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }
      
      throw new ArciumPrivacyError(
        (error as Error).message || ArciumPrivacyError.createHelpfulMessage('ENCRYPTION_FAILED'), // Type assertion
        undefined,
        'ENCRYPTION_FAILED'
      );
    }
  }

  /**
   * Decrypts data using the Arcium Privacy API
   * @param options - Decryption options including encryptedData, key, and method
   * @returns The decrypted data as a string
   */
  async decrypt(options: DecryptOptions): Promise<string> {
    try {
      // Check cache first
      const cachedResult = this.encryptionCache.getCachedDecryption(options.encryptedData, options.key);
      if (cachedResult) {
        return cachedResult;
      }
      
      const response = await this.client.request('/decrypt', {
        method: 'POST',
        body: JSON.stringify({
          encryptedData: options.encryptedData,
          method: options.method || 'aes256',
          password: options.key // Assuming 'key' is used as 'password' in the API
        })
      });

      if (!response.success || !response.data) {
        throw new ArciumPrivacyError(
          response.error || 'Decryption failed',
          undefined,
          'DECRYPTION_FAILED'
        );
      }

      const decryptedData = response.data.decryptedData as string;
      
      // Cache the result for future use
      this.encryptionCache.cacheDecryption(options.encryptedData, options.key, decryptedData);
      
      return decryptedData;
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }
      
      throw new ArciumPrivacyError(
        (error as Error).message || ArciumPrivacyError.createHelpfulMessage('DECRYPTION_FAILED'), // Type assertion
        undefined,
        'DECRYPTION_FAILED'
      );
    }
  }

  /**
   * Derives a cryptographic key from a password
   * @param password - The password to derive a key from
   * @param salt - Optional salt for key derivation
   * @param iterations - Number of iterations for key derivation (default: 100000)
   * @returns The derived key
   */
  async deriveKey(
    password: string,
    salt?: string,
    iterations: number = 100000
  ): Promise<string> {
    try {
      const response = await this.client.request('/derive-key', {
        method: 'POST',
        body: JSON.stringify({
          input: password,
          method: 'pbkdf2',
          salt,
          iterations
        })
      });

      if (!response.success || !response.data) {
        throw new ArciumPrivacyError(
          response.error || 'Key derivation failed',
          undefined,
          'KEY_DERIVATION_FAILED'
        );
      }

      return response.data.key as string;
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }
      
      throw new ArciumPrivacyError(
        (error as Error).message || 'Key derivation failed', // Type assertion
        undefined,
        'KEY_DERIVATION_FAILED'
      );
    }
  }

  /**
   * Encrypts a string with a simple interface
   * @param text - The text to encrypt
   * @param password - Password for encryption
   * @returns The encrypted data
   */
  async encryptText(text: string, password: string): Promise<EncryptionResult> {
    return this.encrypt({ data: text, key: password });
  }

  /**
   * Encrypts a JSON object
   * @param obj - The JSON object to encrypt
   * @param password - Password for encryption
   * @returns The encrypted data
   */
  async encryptJson(obj: any, password: string): Promise<EncryptionResult> {
    const jsonString = JSON.stringify(obj);
    return this.encrypt({ data: jsonString, key: password });
  }

  /**
   * Decrypts and parses a JSON object
   * @param encryptedData - The encrypted data to decrypt
   * @param password - Password for decryption
   * @returns The decrypted JSON object
   */
  async decryptJson(encryptedData: any, password: string): Promise<any> {
    const decryptedText = await this.decrypt({ encryptedData, key: password });
    try {
      return JSON.parse(decryptedText);
    } catch (error: unknown) { // Explicitly type error as unknown
      throw new ArciumPrivacyError(
        (error as Error).message || 'Decrypted data is not valid JSON', // Type assertion
        undefined,
        'JSON_PARSE_ERROR'
      );
    }
  }

  /**
   * Initialize a lazy decryption session
   * @param ttl - Time to live for cached decrypted data (default: 30 minutes)
   * @returns A cache instance for lazy decryption
   */
  initLazyDecryption(ttl: number = 1800000): SimpleCache<string> { // 30 minutes default
    return new SimpleCache<string>(ttl);
  }

  /**
   * Decrypt data on demand with caching
   * @param encryptedData - The encrypted data to decrypt
   * @param password - Password for decryption
   * @param cache - Cache instance to use for storing decrypted data
   * @returns The decrypted data as a string
   */
  async decryptOnDemand(
    encryptedData: any,
    password: string,
    cache?: SimpleCache<string>
  ): Promise<string> {
    // Generate a unique key for this encrypted data
    const key = this.generateCacheKey(encryptedData, password);
    
    // Check cache first if provided
    if (cache) {
      const cachedResult = cache.get(key);
      if (cachedResult) {
        return cachedResult;
      }
    }
    
    // Decrypt if not in cache
    const decryptedData = await this.decrypt({ encryptedData, key: password });
    
    // Cache the result if cache is provided
    if (cache) {
      cache.set(key, decryptedData);
    }
    
    return decryptedData;
  }

  /**
   * Batch decrypt with lazy loading
   * @param encryptedDataList - List of encrypted data to decrypt
   * @param password - Password for decryption
   * @param cache - Cache instance to use for storing decrypted data
   * @returns Map of original index/key to decrypted data
   */
  async decryptBatchLazy(
    encryptedDataList: Array<{ id: string, data: any }>,
    password: string,
    cache?: SimpleCache<string>
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};
    
    // Process in parallel but with rate limiting
    const batchSize = 5;
    for (let i = 0; i < encryptedDataList.length; i += batchSize) {
      const batch = encryptedDataList.slice(i, i + batchSize);
      
      const batchPromises = batch.map(item => 
        this.decryptOnDemand(item.data, password, cache)
          .then(decrypted => ({ id: item.id, decrypted }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ id, decrypted }) => {
        results[id] = decrypted;
      });
    }
    
    return results;
  }

  /**
   * Generate a cache key for encrypted data
   */
  private generateCacheKey(encryptedData: any, password: string): string {
    // Create a deterministic key based on encrypted data and password
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
}
