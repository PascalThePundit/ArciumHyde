import { ArciumPrivacyClient } from './client';
import { EncryptionService } from './services/encryption';
import { ZkProofService } from './services/zkproof';
import { SelectiveDisclosureService } from './services/selective-disclosure';
import { PrivacyConfig, EncryptOptions, DecryptOptions, RangeProofParams, BalanceProofParams, CustomProofParams } from './types';
import { PrimitiveRegistry } from './services/PrimitiveRegistry';
import { ComposabilityEngine } from './services/ComposabilityEngine';
import { PluginManager } from './services/PluginManager';
import { CrossProtocolPrivacyBridge } from './services/CrossProtocolPrivacyBridge';
import { ArciumPrivacyError } from './errors';

/**
 * Arcium Privacy SDK - The official JavaScript/TypeScript SDK for Arcium's Privacy-as-a-Service
 * 
 * This SDK provides simple methods to integrate privacy features like encryption,
 * zero-knowledge proofs, selective disclosure, MPC, FHE, and TEE into your applications.
 * 
 * @example
 * ```typescript
 * import { ArciumPrivacy } from '@arcium/privacy-sdk';
 * 
 * const privacy = new ArciumPrivacy({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.arcium-privacy.com'
 * });
 * 
 * // Encrypt data
 * const encrypted = await privacy.encrypt('sensitive data', 'my-password');
 * 
 * // Generate a zero-knowledge proof
 * const proof = await privacy.prove('range', { value: 25, min: 18, max: 100 });
 * 
 * // Perform MPC operations
 * const mpcResult = await privacy.performMPC([1, 2, 3], 'sum');
 * 
 * // Perform FHE operations
 * const fheResult = await privacy.performFHE(encryptedValue1, '+', encryptedValue2);
 * ```
 */
export class ArciumPrivacy { // Changed to named export
  private client: ArciumPrivacyClient;
  private encryption: EncryptionService;
  private zkProof: ZkProofService;
  private selectiveDisclosure: SelectiveDisclosureService;

  /**
   * Creates a new instance of the Arcium Privacy SDK
   * @param config - Configuration options for the SDK
   */
  constructor(config: PrivacyConfig) {
    this.client = new ArciumPrivacyClient(config);
    this.encryption = new EncryptionService(this.client);
    this.zkProof = new ZkProofService(this.client);
    this.selectiveDisclosure = new SelectiveDisclosureService(this.client);
  }

  /**
   * Encrypts data using the specified method
   * @param data - The data to encrypt (string or Buffer)
   * @param password - Password for encryption (required for symmetric encryption)
   * @param options - Additional encryption options
   * @returns The encrypted data
   * 
   * @example
   * ```typescript
   * const encrypted = await privacy.encrypt('sensitive data', 'my-password');
   * ```
   */
  async encrypt(
    data: string | Buffer,
    password: string,
    options?: { method?: string }
  ) {
    const encryptOptions: EncryptOptions = {
      data: data.toString(), // Assuming data is always convertible to string for EncryptOptions
      key: password,
      method: options?.method,
    };
    return this.encryption.encrypt(encryptOptions);
  }

  /**
   * Decrypts data using the specified method
   * @param encryptedData - The encrypted data to decrypt
   * @param password - Password for decryption (required for symmetric encryption)
   * @param options - Additional decryption options
   * @returns The decrypted data as a string
   * 
   * @example
   * ```typescript
   * const decrypted = await privacy.decrypt(encryptedData, 'my-password');
   * ```
   */
  async decrypt(
    encryptedData: any,
    password: string,
    options?: { method?: string }
  ) {
    const decryptOptions: DecryptOptions = {
      encryptedData: encryptedData.toString(), // Assuming encryptedData is always convertible to string
      key: password,
      method: options?.method,
    };
    return this.encryption.decrypt(decryptOptions);
  }

  /**
   * Generates a zero-knowledge proof based on the specified type
   * @param type - The type of proof to generate ('range', 'balance', 'custom')
   * @param params - Parameters for the proof generation
   * @returns The generated zero-knowledge proof
   * 
   * @example
   * ```typescript
   * // Prove that a value is within a range
   * const rangeProof = await privacy.prove('range', { value: 25, min: 18, max: 100 });
   * 
   * // Prove that a balance is greater than a threshold
   * const balanceProof = await privacy.prove('balance', { balance: 1500, threshold: 1000 });
   * ```
   */
  async prove(
    type: 'range' | 'balance' | 'custom',
    params: RangeProofParams | BalanceProofParams | CustomProofParams
  ) {
    switch (type) {
      case 'range':
        const rangeParams = params as RangeProofParams;
        return this.zkProof.generateRangeProof(
          rangeParams.value,
          rangeParams.min,
          rangeParams.max
        );
      case 'balance':
        const balanceParams = params as BalanceProofParams;
        return this.zkProof.generateBalanceProof(
          balanceParams.balance,
          balanceParams.threshold
        );
      case 'custom':
        const customParams = params as CustomProofParams;
        return this.zkProof.generateProof(
          customParams.circuitName,
          customParams.inputs
        );
      default:
        throw new Error(`Unknown proof type: ${type}`);
    }
  }

  /**
   * Verifies a zero-knowledge proof
   * @param proof - The proof to verify
   * @returns Whether the proof is valid
   * 
   * @example
   * ```typescript
   * const isValid = await privacy.verify(proof);
   * console.log('Proof is valid:', isValid);
   * ```
   */
  async verify(proof: any) {
    return this.zkProof.verifyProof(proof);
  }

  /**
   * Issues a verifiable claim
   * @param claimData - The data for the claim
   * @returns The issued claim
   * 
   * @example
   * ```typescript
   * const claim = await privacy.issueClaim({
   *   type: 'age_verification',
   *   subject: 'user-id',
   *   attributes: { age: 25 },
   *   disclosurePolicy: {
   *     public: [],
   *     private: ['age']
   *   }
   * });
   * ```
   */
  async issueClaim(claimData: any) {
    return this.selectiveDisclosure.issueClaim(claimData);
  }

  /**
   * Creates a disclosure request
   * @param requestData - The disclosure request data
   * @returns The created disclosure request
   * 
   * @example
   * ```typescript
   * const request = await privacy.createDisclosureRequest({
   *   verifier: 'dapp-id',
   *   requestedClaims: [{
   *     type: 'age_verification',
   *     requiredAttributes: ['age']
   *   }],
   *   justification: 'Age verification required'
   * });
   * ```
   */
  async createDisclosureRequest(requestData: any) {
    return this.selectiveDisclosure.createDisclosureRequest(requestData);
  }

  /**
   * Responds to a disclosure request
   * @param request - The disclosure request
   * @param claims - The claims to use for the response
   * @returns The disclosure response
   * 
   * @example
   * ```typescript
   * const response = await privacy.respondToDisclosureRequest(request, [claim]);
   * ```
   */
  async respondToDisclosureRequest(request: any, claims: any[]) {
    return this.selectiveDisclosure.respondToRequest(request, claims);
  }

  /**
   * Verifies a disclosure response
   * @param response - The disclosure response to verify
   * @param request - The original disclosure request
   * @returns Whether the disclosure response is valid
   * 
   * @example
   * ```typescript
   * const isValid = await privacy.verifyDisclosure(response, originalRequest);
   * console.log('Disclosure is valid:', isValid);
   * ```
   */
  async verifyDisclosure(response: any, request: any) {
    return this.selectiveDisclosure.verifyResponse(response, request);
  }

  /**
   * Gets the current account balance
   * @returns The account balance
   */
  async getBalance() {
    return this.client.getBalance();
  }

  /**
   * Gets usage statistics for the current account
   * @returns The usage statistics
   */
  async getUsage() {
    return this.client.getUsage();
  }

  /**
   * Gets the status of the service
   * @returns The service status
   */
  async healthCheck() {
    return this.client.healthCheck();
  }

  /**
   * Initialize a lazy decryption session
   * @param ttl - Time to live for cached decrypted data (default: 30 minutes)
   * @returns A cache instance for lazy decryption
   * 
   * @example
   * ```typescript
   * const lazyDecryptor = await privacy.initLazyDecryption();
   * const decrypted = await privacy.decryptOnDemand(encryptedData, 'password', lazyDecryptor);
   * ```
   */
  initLazyDecryption(ttl: number = 1800000) {
    return this.encryption.initLazyDecryption(ttl);
  }

  /**
   * Decrypt data on demand with caching
   * @param encryptedData - The encrypted data to decrypt
   * @param password - Password for decryption
   * @param cache - Cache instance to use for storing decrypted data
   * @returns The decrypted data as a string
   * 
   * @example
   * ```typescript
   * const lazyDecryptor = privacy.initLazyDecryption();
   * const decrypted = await privacy.decryptOnDemand(encryptedData, 'password', lazyDecryptor);
   * ```
   */
  async decryptOnDemand(
    encryptedData: any,
    password: string,
    cache?: any
  ) {
    return this.encryption.decryptOnDemand(encryptedData, password, cache);
  }

  /**
   * Batch decrypt with lazy loading
   * @param encryptedDataList - List of encrypted data to decrypt
   * @param password - Password for decryption
   * @param cache - Cache instance to use for storing decrypted data
   * @returns Map of original index/key to decrypted data
   * 
   * @example
   * ```typescript
   * const lazyDecryptor = privacy.initLazyDecryption();
   * const results = await privacy.decryptBatchLazy(
   *   [{id: '1', data: encrypted1}, {id: '2', data: encrypted2}],
   *   'password',
   *   lazyDecryptor
   * );
   * ```
   */
  async decryptBatchLazy(
    encryptedDataList: Array<{ id: string, data: any }>,
    password: string,
    cache?: any
  ) {
    return this.encryption.decryptBatchLazy(encryptedDataList, password, cache);
  }

  /**
   * Get the primitive registry for managing privacy primitives.
   * This registry allows for dynamic registration and retrieval of privacy primitives,
   * enabling the SDK to be extended with new cryptographic operations or data transformations.
   * @returns PrimitiveRegistry instance
   * 
   * @example
   * ```typescript
   * const registry = privacy.getPrimitiveRegistry();
   * // Register a new custom primitive
   * registry.registerPrimitive(new MyCustomPrimitive());
   * const primitives = registry.getAllPrimitives();
   * ```
   */
  getPrimitiveRegistry() {
    return PrimitiveRegistry.getInstance();
  }

  /**
   * Get the composability engine for chaining privacy operations
   * @returns ComposabilityEngine instance
   * 
   * @example
   * ```typescript
   * const engine = privacy.getComposabilityEngine();
   * const result = await engine.executeWorkflow('my-workflow', {input: 'data'});
   * ```
   */
  getComposabilityEngine() {
    return new ComposabilityEngine();
  }

  /**
   * Get the plugin manager for extending privacy functionality.
   * The plugin manager allows developers to load custom plugins that can add new features,
   * modify existing behaviors, or integrate with external services.
   * @returns PluginManager instance
   * 
   * @example
   * ```typescript
   * const pluginManager = privacy.getPluginManager();
   * // Assuming MyCustomPlugin is defined elsewhere
   * await pluginManager.loadPlugin(new MyCustomPlugin());
   * ```
   */
  getPluginManager() {
    return PluginManager.getInstance();
  }

  /**
   * Get the cross-protocol privacy bridge
   * @returns CrossProtocolPrivacyBridge instance
   * 
   * @example
   * ```typescript
   * const bridge = privacy.getCrossProtocolBridge();
   * const result = await bridge.executeBridge('solana-to-ethereum', {data: 'value'});
   * ```
   */
  getCrossProtocolBridge() {
    return new CrossProtocolPrivacyBridge();
  }

  /**
   * Perform Multi-Party Computation (MPC) operation.
   * This method sends an MPC request to the Arcium Privacy API to perform a secure computation
   * on a set of values without revealing the individual values to any single party.
   * @param values - An array of numbers to perform the MPC operation on. These values are sent securely.
   * @param operation - The cryptographic operation to perform (e.g., 'sum', 'multiply', 'average'). Defaults to 'sum'.
   * @returns A Promise that resolves to the numerical result of the MPC operation.
   * @throws {ArciumPrivacyError} If the MPC operation fails or the API returns an error.
   * 
   * @example
   * ```typescript
   * // Perform a secure sum of values
   * const mpcSumResult = await privacy.performMPC([10, 20, 30], 'sum');
   * console.log('MPC Sum Result:', mpcSumResult); // e.g., 60
   *
   * // Perform a secure multiplication
   * const mpcMultiplyResult = await privacy.performMPC([2, 3, 4], 'multiply');
   * console.log('MPC Multiply Result:', mpcMultiplyResult); // e.g., 24
   * ```
   */
  async performMPC(values: number[], operation: string = 'sum'): Promise<number> {
    const response = await this.client.request('/mpc', {
      method: 'POST',
      body: JSON.stringify({
        operation,
        values
      })
    });

    if (!response.success || !response.data) {
      throw new ArciumPrivacyError(
        response.error || 'MPC operation failed',
        undefined,
        'MPC_OPERATION_FAILED'
      );
    }

    return response.data.result as number;
  }

  /**
   * Perform Fully Homomorphic Encryption operation
   * @param encryptedValue1 - First encrypted value
   * @param operation - The operation ('+', '-', '*', '/')
   * @param encryptedValue2 - Second encrypted value (for binary operations)
   * @returns The result of the FHE operation
   * 
   * @example
   * ```typescript
   * const result = await privacy.performFHE(encrypted1, '+', encrypted2);
   * ```
   */
  async performFHE(encryptedValue1: any, operation: string, encryptedValue2?: any): Promise<any> {
    const response = await this.client.request('/fhe', {
      method: 'POST',
      body: JSON.stringify({
        operation,
        encryptedValue1,
        encryptedValue2
      })
    });

    if (!response.success || !response.data) {
      throw new ArciumPrivacyError(
        response.error || 'FHE operation failed',
        undefined,
        'FHE_OPERATION_FAILED'
      );
    }

    return response.data.result;
  }

  /**
   * Perform TEE-secured operation
   * @param data - The data to process securely
   * @param operation - The operation to perform within TEE
   * @returns The result of the TEE operation
   * 
   * @example
   * ```typescript
   * const result = await privacy.performTEE(data, 'hash');
   * ```
   */
  async performTEE(data: any, operation: string): Promise<any> {
    const response = await this.client.request('/tee', {
      method: 'POST',
      body: JSON.stringify({
        operation,
        data
      })
    });

    if (!response.success || !response.data) {
      throw new ArciumPrivacyError(
        response.error || 'TEE operation failed',
        undefined,
        'TEE_OPERATION_FAILED'
      );
    }

    return response.data.result;
  }

  /**
   * Store data with privacy protection
   * @param data - The data to store privately
   * @param key - The key for storage
   * @returns Whether the storage was successful
   * 
   * @example
   * ```typescript
   * const success = await privacy.storePrivately(data, 'user-profile');
   * ```
   */
  async storePrivately(data: any, key: string): Promise<boolean> {
    const response = await this.client.request('/store-private', {
      method: 'POST',
      body: JSON.stringify({
        data,
        key
      })
    });

    if (!response.success) {
      throw new ArciumPrivacyError(
        response.error || 'Private storage failed',
        undefined,
        'PRIVATE_STORAGE_FAILED'
      );
    }

    return response.success;
  }

  /**
   * Retrieve data with privacy preservation
   * @param key - The key for retrieval
   * @returns The retrieved data, or null if not found
   * 
   * @example
   * ```typescript
   * const data = await privacy.retrievePrivately('user-profile');
   * ```
   */
  async retrievePrivately(key: string): Promise<any> {
    const response = await this.client.request(`/retrieve-private/${key}`, {
      method: 'GET'
    });

    if (response.success && response.data) {
      return response.data.result;
    }

    return null;
  }
}

// Export types
export * from './types';

// Removed default export for consistent named exports
// export default ArciumPrivacy;