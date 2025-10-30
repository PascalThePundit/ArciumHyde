# API Reference

Complete reference for the Arcium Privacy SDK API with all methods, parameters, and examples.

## ArciumPrivacy Class

The main class for interacting with Arcium Privacy services.

### Constructor

```typescript
new ArciumPrivacy(config: PrivacyConfig)
```

**Parameters:**
- `config` (PrivacyConfig): Configuration object
  - `apiKey` (string): Your Arcium API key
  - `baseUrl` (string, optional): API base URL (default: "https://api.arcium-privacy.com")

**Example:**
```typescript
import { ArciumPrivacy } from '@arcium/privacy-sdk';

const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.arcium-privacy.com'
});
```

## Methods

### encrypt

Encrypt data using the specified method.

```typescript
async encrypt(
  data: string | Buffer,
  password: string,
  options?: { method?: string }
): Promise<EncryptionResult>
```

**Parameters:**
- `data` (string | Buffer): The data to encrypt
- `password` (string): Password for encryption
- `options` (optional): Additional options
  - `method` (string, optional): Encryption method (default: "aes256")

**Returns:** `Promise<EncryptionResult>` - The encrypted data

**Example:**
```typescript
const encrypted = await privacy.encrypt('sensitive data', 'password');
console.log(encrypted);
// { data: 'encrypted_base64_data', salt: 'salt_value', iv: 'iv_value', method: 'aes256' }
```

### decrypt

Decrypt data using the specified method.

```typescript
async decrypt(
  encryptedData: any,
  password: string,
  options?: { method?: string }
): Promise<string>
```

**Parameters:**
- `encryptedData` (any): The encrypted data to decrypt
- `password` (string): Password for decryption
- `options` (optional): Additional options
  - `method` (string, optional): Decryption method (default: "aes256")

**Returns:** `Promise<string>` - The decrypted data

**Example:**
```typescript
const decrypted = await privacy.decrypt(encryptedData, 'password');
console.log(decrypted); // Original data string
```

### prove

Generate a zero-knowledge proof based on the specified type.

```typescript
async prove(
  type: 'range' | 'balance' | 'custom',
  params: any
): Promise<any>
```

**Parameters:**
- `type` (string): The type of proof to generate
  - `'range'`: Range proof
  - `'balance'`: Balance proof
  - `'custom'`: Custom proof
- `params` (any): Parameters for the proof generation

**Returns:** `Promise<any>` - The generated zero-knowledge proof

**Example (Range Proof):**
```typescript
const rangeProof = await privacy.prove('range', {
  value: 25,    // Value to prove (kept private)
  min: 18,      // Minimum value
  max: 100      // Maximum value
});
```

**Example (Balance Proof):**
```typescript
const balanceProof = await privacy.prove('balance', {
  balance: 1500,    // Balance to prove (kept private)
  threshold: 1000   // Threshold value
});
```

**Example (Custom Proof):**
```typescript
const customProof = await privacy.prove('custom', {
  circuitName: 'custom_circuit',
  inputs: { a: 5, b: 3 }
});
```

### verify

Verify a zero-knowledge proof.

```typescript
async verify(proof: any): Promise<boolean>
```

**Parameters:**
- `proof` (any): The proof to verify

**Returns:** `Promise<boolean>` - Whether the proof is valid

**Example:**
```typescript
const isValid = await privacy.verify(rangeProof);
console.log(isValid); // true or false
```

### issueClaim

Issue a verifiable claim.

```typescript
async issueClaim(claimData: any): Promise<any>
```

**Parameters:**
- `claimData` (any): The data for the claim
  - `type` (string): Type of claim
  - `subject` (string): Subject of the claim
  - `attributes` (object): Attributes to include in the claim
  - `disclosurePolicy` (object): Policy for disclosure
    - `public` (string[]): Attributes that are public
    - `private` (string[]): Attributes that remain private

**Returns:** `Promise<any>` - The issued claim

**Example:**
```typescript
const claim = await privacy.issueClaim({
  type: 'age_verification',
  subject: 'user-id-123',
  attributes: { age: 25 },
  disclosurePolicy: {
    public: [],
    private: ['age']
  }
});
```

### createDisclosureRequest

Create a disclosure request.

```typescript
async createDisclosureRequest(requestData: any): Promise<any>
```

**Parameters:**
- `requestData` (any): The disclosure request data
  - `verifier` (string): ID of the verifier
  - `requestedClaims` (array): Claims requested
  - `justification` (string): Justification for the request

**Returns:** `Promise<any>` - The created disclosure request

**Example:**
```typescript
const request = await privacy.createDisclosureRequest({
  verifier: 'dapp-id-456',
  requestedClaims: [{
    type: 'age_verification',
    requiredAttributes: ['age']
  }],
  justification: 'Age verification required for service access'
});
```

### respondToDisclosureRequest

Respond to a disclosure request.

```typescript
async respondToDisclosureRequest(
  request: any,
  claims: any[]
): Promise<any>
```

**Parameters:**
- `request` (any): The disclosure request
- `claims` (any[]): The claims to use for the response

**Returns:** `Promise<any>` - The disclosure response

**Example:**
```typescript
const response = await privacy.respondToDisclosureRequest(
  request,
  [claim]
);
```

### verifyDisclosure

Verify a disclosure response.

```typescript
async verifyDisclosure(
  response: any,
  request: any
): Promise<boolean>
```

**Parameters:**
- `response` (any): The disclosure response to verify
- `request` (any): The original disclosure request

**Returns:** `Promise<boolean>` - Whether the disclosure response is valid

**Example:**
```typescript
const isValid = await privacy.verifyDisclosure(response, request);
console.log(isValid); // true or false
```

### getBalance

Get the current account balance.

```typescript
async getBalance(): Promise<number>
```

**Returns:** `Promise<number>` - The account balance

**Example:**
```typescript
const balance = await privacy.getBalance();
console.log(`Account balance: ${balance}`);
```

### getUsage

Get usage statistics for the current account.

```typescript
async getUsage(): Promise<any>
```

**Returns:** `Promise<any>` - The usage statistics

**Example:**
```typescript
const usage = await privacy.getUsage();
console.log(usage);
```

### healthCheck

Get the status of the service.

```typescript
async healthCheck(): Promise<any>
```

**Returns:** `Promise<any>` - The service status

**Example:**
```typescript
const status = await privacy.healthCheck();
console.log(status);
```

## Performance Optimization Methods

### initLazyDecryption

Initialize a lazy decryption session.

```typescript
initLazyDecryption(ttl?: number): SimpleCache<string>
```

**Parameters:**
- `ttl` (number, optional): Time to live for cached decrypted data in milliseconds (default: 1800000 - 30 minutes)

**Returns:** `SimpleCache<string>` - A cache instance for lazy decryption

**Example:**
```typescript
const lazyDecryptor = privacy.initLazyDecryption(3600000); // 1 hour TTL
```

### decryptOnDemand

Decrypt data on demand with caching.

```typescript
async decryptOnDemand(
  encryptedData: any,
  password: string,
  cache?: SimpleCache<string>
): Promise<string>
```

**Parameters:**
- `encryptedData` (any): The encrypted data to decrypt
- `password` (string): Password for decryption
- `cache` (SimpleCache<string>, optional): Cache instance for storing decrypted data

**Returns:** `Promise<string>` - The decrypted data

**Example:**
```typescript
const lazyDecryptor = privacy.initLazyDecryption();
const decrypted = await privacy.decryptOnDemand(
  encryptedData,
  'password',
  lazyDecryptor
);
```

### decryptBatchLazy

Batch decrypt with lazy loading.

```typescript
async decryptBatchLazy(
  encryptedDataList: Array<{id: string, data: any}>,
  password: string,
  cache?: SimpleCache<string>
): Promise<Record<string, string>>
```

**Parameters:**
- `encryptedDataList` (array): List of encrypted data to decrypt
- `password` (string): Password for decryption
- `cache` (SimpleCache<string>, optional): Cache instance for storing decrypted data

**Returns:** `Promise<Record<string, string>>` - Map of original index/key to decrypted data

**Example:**
```typescript
const results = await privacy.decryptBatchLazy(
  [
    {id: '1', data: encrypted1},
    {id: '2', data: encrypted2}
  ],
  'password',
  lazyDecryptor
);
```

## Composability Methods

### getPrimitiveRegistry

Get the primitive registry for managing privacy primitives.

```typescript
getPrimitiveRegistry(): PrimitiveRegistry
```

**Returns:** `PrimitiveRegistry` - PrimitiveRegistry instance

**Example:**
```typescript
const registry = privacy.getPrimitiveRegistry();
const primitives = registry.getAllPrimitives();
```

### getComposabilityEngine

Get the composability engine for chaining privacy operations.

```typescript
getComposabilityEngine(): ComposabilityEngine
```

**Returns:** `ComposabilityEngine` - ComposabilityEngine instance

**Example:**
```typescript
const engine = privacy.getComposabilityEngine();
const result = await engine.executeWorkflow('my-workflow', {input: 'data'});
```

### getPluginManager

Get the plugin manager for extending privacy functionality.

```typescript
getPluginManager(): PluginManager
```

**Returns:** `PluginManager` - PluginManager instance

**Example:**
```typescript
const pluginManager = privacy.getPluginManager();
await pluginManager.loadPlugin(myPlugin);
```

### getCrossProtocolBridge

Get the cross-protocol privacy bridge.

```typescript
getCrossProtocolBridge(): CrossProtocolPrivacyBridge
```

**Returns:** `CrossProtocolPrivacyBridge` - CrossProtocolPrivacyBridge instance

**Example:**
```typescript
const bridge = privacy.getCrossProtocolBridge();
const result = await bridge.executeBridge('solana-to-ethereum', {data: 'value'});
```

## Error Handling

All methods may throw the following errors:

### ArciumPrivacyError
Base error class for all Arcium Privacy errors.

**Properties:**
- `message` (string): Error description
- `code` (string): Error code
- `status` (number, optional): HTTP status code

**Common Error Codes:**
- `ENCRYPTION_FAILED`: Encryption operation failed
- `DECRYPTION_FAILED`: Decryption operation failed
- `PROOF_GENERATION_FAILED`: Zero-knowledge proof generation failed
- `PROOF_VERIFICATION_FAILED`: Zero-knowledge proof verification failed
- `INVALID_API_KEY`: Invalid or expired API key
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `INSUFFICIENT_CREDITS`: Insufficient account credits
- `INVALID_INPUT`: Invalid input parameters
- `NETWORK_ERROR`: Network connectivity error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

**Example Error Handling:**
```typescript
try {
  const result = await privacy.encrypt('data', 'password');
  console.log(result);
} catch (error) {
  if (error.code === 'ENCRYPTION_FAILED') {
    console.error('Encryption failed:', error.message);
  } else if (error.code === 'INVALID_API_KEY') {
    console.error('Invalid API key:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Type Definitions

### PrivacyConfig
Configuration for Arcium Privacy SDK.

```typescript
interface PrivacyConfig {
  apiKey: string;
  baseUrl?: string;
}
```

### EncryptionResult
Result of an encryption operation.

```typescript
interface EncryptionResult {
  data: string;     // Encrypted data
  salt: string;     // Salt used in encryption
  iv: string;       // Initialization vector
  method: string;   // Encryption method used
}
```

---

Continue to [Tutorials](./tutorials.md) for step-by-step guides with complete examples.