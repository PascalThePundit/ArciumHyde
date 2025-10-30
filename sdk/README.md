# Arcium Privacy SDK

[![npm version](https://img.shields.io/npm/v/@arcium/privacy-sdk.svg)](https://www.npmjs.com/package/@arcium/privacy-sdk)
[![License](https://img.shields.io/npm/l/@arcium/privacy-sdk.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/@arcium/privacy-sdk.svg)](https://www.npmjs.com/package/@arcium/privacy-sdk)

The official JavaScript/TypeScript SDK for Arcium's Privacy-as-a-Service platform. This SDK provides simple methods to integrate privacy features like encryption, zero-knowledge proofs, and selective disclosure into your applications.

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

## Installation

### Node.js
```bash
npm install @arcium/privacy-sdk
# or
yarn add @arcium/privacy-sdk
```

### Browser (CDN)
```html
<script src="https://unpkg.com/@arcium/privacy-sdk@latest/dist/arcium-privacy-sdk.min.js"></script>
```

## Quick Start

Get up and running with privacy features in just a few lines of code:

```typescript
import ArciumPrivacy from '@arcium/privacy-sdk';

// Initialize the SDK with your API key
const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.arcium-privacy.com'  // Optional, defaults to production
});

// Encrypt sensitive data
const encrypted = await privacy.encrypt('sensitive information', 'my-password');
console.log('Encrypted:', encrypted);

// Prove that a value is within a range without revealing the value
const proof = await privacy.prove('range', { 
  value: 25, 
  min: 18, 
  max: 100 
});
console.log('Proof generated:', proof);

// Verify the proof
const isValid = await privacy.verify(proof);
console.log('Proof is valid:', isValid);
```

## API Reference

### ArciumPrivacy

#### `new ArciumPrivacy(config)`

Initializes a new instance of the Arcium Privacy SDK.

**Parameters:**
- `config` (object): Configuration options
  - `apiKey` (string): Your Arcium API key
  - `baseUrl` (string, optional): Base URL for the API (defaults to production)
  - `timeout` (number, optional): Request timeout in milliseconds (default: 30000)
  - `debug` (boolean, optional): Enable debug logging (default: false)

**Example:**
```javascript
const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.arcium-privacy.com',
  timeout: 60000,
  debug: true
});
```

#### `encrypt(data, password, options)`

Encrypts data using the specified method.

**Parameters:**
- `data` (string | Buffer): The data to encrypt
- `password` (string): Password for encryption
- `options` (object, optional): Additional encryption options
  - `method` (string, optional): Encryption method ('aes256', 'rsa', 'secp256k1'; default: 'aes256')

**Returns:** Promise containing encrypted data.

**Example:**
```javascript
const encrypted = await privacy.encrypt('sensitive data', 'my-password');
```

#### `decrypt(encryptedData, password, options)`

Decrypts data using the specified method.

**Parameters:**
- `encryptedData` (any): The encrypted data to decrypt
- `password` (string): Password for decryption
- `options` (object, optional): Additional decryption options
  - `method` (string, optional): Decryption method (default: 'aes256')

**Returns:** Promise containing decrypted data as string.

**Example:**
```javascript
const decrypted = await privacy.decrypt(encryptedData, 'my-password');
```

#### `prove(type, params)`

Generates a zero-knowledge proof based on the specified type.

**Parameters:**
- `type` ('range' | 'balance' | 'custom'): The type of proof to generate
- `params` (object): Parameters for the proof generation

**Returns:** Promise containing the generated zero-knowledge proof.

**Examples:**
```javascript
// Range proof: prove that a value is within a range
const rangeProof = await privacy.prove('range', { value: 25, min: 18, max: 100 });

// Balance proof: prove that a balance is greater than a threshold
const balanceProof = await privacy.prove('balance', { balance: 1500, threshold: 1000 });

// Custom proof: generate a proof using a specific circuit
const customProof = await privacy.prove('custom', { 
  circuitName: 'my_circuit', 
  inputs: { x: 5, y: 10 } 
});
```

#### `verify(proof)`

Verifies a zero-knowledge proof.

**Parameters:**
- `proof` (any): The proof to verify

**Returns:** Promise containing whether the proof is valid.

**Example:**
```javascript
const isValid = await privacy.verify(proof);
console.log('Proof is valid:', isValid);
```

#### `issueClaim(claimData)`

Issues a verifiable claim.

**Parameters:**
- `claimData` (object): The data for the claim
  - `type` (string): Type of the claim
  - `subject` (string): The subject of the claim
  - `attributes` (object): Attributes contained in the claim
  - `disclosurePolicy` (object, optional): Disclosure policy for the claim
  - `expirationDate` (number, optional): When the claim expires

**Returns:** Promise containing the issued claim.

**Example:**
```javascript
const claim = await privacy.issueClaim({
  type: 'age_verification',
  subject: 'user-id',
  attributes: { age: 25 },
  disclosurePolicy: {
    public: [],
    private: ['age']
  }
});
```

#### `createDisclosureRequest(requestData)`

Creates a disclosure request.

**Parameters:**
- `requestData` (object): The disclosure request data
  - `verifier` (string): The verifier requesting the disclosure
  - `requestedClaims` (array): Claims requested in the disclosure
  - `justification` (string): Reason for the request

**Returns:** Promise containing the created disclosure request.

**Example:**
```javascript
const request = await privacy.createDisclosureRequest({
  verifier: 'dapp-id',
  requestedClaims: [{
    type: 'age_verification',
    requiredAttributes: ['age']
  }],
  justification: 'Age verification required'
});
```

#### `respondToDisclosureRequest(request, claims)`

Responds to a disclosure request.

**Parameters:**
- `request` (object): The disclosure request
- `claims` (array): The claims to use for the response

**Returns:** Promise containing the disclosure response.

**Example:**
```javascript
const response = await privacy.respondToDisclosureRequest(request, [claim]);
```

#### `verifyDisclosure(response, request)`

Verifies a disclosure response.

**Parameters:**
- `response` (object): The disclosure response to verify
- `request` (object): The original disclosure request

**Returns:** Promise containing whether the disclosure response is valid.

**Example:**
```javascript
const isValid = await privacy.verifyDisclosure(response, originalRequest);
console.log('Disclosure is valid:', isValid);
```

#### `getBalance()`

Gets the current account balance.

**Returns:** Promise containing the account balance.

**Example:**
```javascript
const balance = await privacy.getBalance();
console.log('Account balance:', balance);
```

#### `getUsage()`

Gets usage statistics for the current account.

**Returns:** Promise containing the usage statistics.

**Example:**
```javascript
const usage = await privacy.getUsage();
console.log('Usage:', usage);
```

#### `healthCheck()`

Checks the status of the service.

**Returns:** Promise containing the service status.

**Example:**
```javascript
const status = await privacy.healthCheck();
console.log('Service status:', status);
```

## Examples

### 1. Basic Encryption/Decryption

```javascript
import ArciumPrivacy from '@arcium/privacy-sdk';

const privacy = new ArciumPrivacy({ apiKey: 'your-api-key' });

async function exampleEncryption() {
  // Encrypt data
  const data = 'This is a secret message';
  const password = 'my-secure-password';
  
  const encrypted = await privacy.encrypt(data, password);
  console.log('Encrypted:', encrypted);

  // Decrypt data
  const decrypted = await privacy.decrypt(encrypted.encryptedData, password);
  console.log('Decrypted:', decrypted);
}

exampleEncryption();
```

### 2. Age Verification with Zero-Knowledge Proofs

```javascript
import ArciumPrivacy from '@arcium/privacy-sdk';

const privacy = new ArciumPrivacy({ apiKey: 'your-api-key' });

async function exampleAgeVerification() {
  // User's age (kept private)
  const userAge = 25;
  
  // Generate a proof that the user is at least 18 years old
  const ageProof = await privacy.prove('range', {
    value: userAge,
    min: 18,
    max: 100
  });
  
  console.log('Age proof generated:', ageProof);
  
  // Verify the proof (this can be done by any verifier)
  const isValid = await privacy.verify(ageProof);
  console.log('Age proof is valid:', isValid);
}

exampleAgeVerification();
```

### 3. Verifiable Claims

```javascript
import ArciumPrivacy from '@arcium/privacy-sdk';

const privacy = new ArciumPrivacy({ apiKey: 'your-api-key' });

async function exampleClaims() {
  // Issue a credit score claim
  const creditClaim = await privacy.issueClaim({
    type: 'credit_score_verification',
    subject: 'user123',
    attributes: { score: 750 },
    disclosurePolicy: {
      public: [],
      conditional: [{
        attribute: 'score',
        condition: 'score >= 700',
        requiredBy: ['bank-verifier']
      }],
      private: ['score']
    }
  });
  console.log('Credit claim issued:', creditClaim);

  // Create a disclosure request
  const request = await privacy.createDisclosureRequest({
    verifier: 'bank-verifier',
    requestedClaims: [{
      type: 'credit_score_verification',
      requiredAttributes: ['score']
    }],
    justification: 'Credit check for loan application'
  });
  console.log('Disclosure request created:', request);

  // Respond to the disclosure request
  const response = await privacy.respondToDisclosureRequest(request, [creditClaim]);
  console.log('Disclosure response:', response);

  // Verify the response
  const isValid = await privacy.verifyDisclosure(response, request);
  console.log('Disclosure response is valid:', isValid);
}

exampleClaims();
```

## Advanced Usage

### Custom Proof Generation

For more complex privacy requirements, you can generate custom zero-knowledge proofs:

```javascript
import ArciumPrivacy from '@arcium/privacy-sdk';

const privacy = new ArciumPrivacy({ apiKey: 'your-api-key' });

async function customProof() {
  // Generate a custom proof using a specific circuit
  const customProof = await privacy.prove('custom', {
    circuitName: 'my_custom_circuit',
    inputs: {
      x: 10,
      y: 20,
      expected_result: 30
    }
  });
  
  console.log('Custom proof:', customProof);
  
  // Verify the custom proof
  const isValid = await privacy.verify(customProof);
  console.log('Custom proof is valid:', isValid);
}
```

### Batch Operations

Perform multiple operations efficiently:

```javascript
import ArciumPrivacy from '@arcium/privacy-sdk';

const privacy = new ArciumPrivacy({ apiKey: 'your-api-key' });

async function batchOperations() {
  try {
    // Encrypt multiple pieces of data
    const dataToEncrypt = [
      { id: 1, text: 'Private message 1' },
      { id: 2, text: 'Private message 2' },
      { id: 3, text: 'Private message 3' }
    ];
    
    const encryptionPromises = dataToEncrypt.map(async (item) => ({
      id: item.id,
      encrypted: await privacy.encrypt(item.text, `password_${item.id}`)
    }));
    
    const encryptedResults = await Promise.all(encryptionPromises);
    console.log('All data encrypted:', encryptedResults);
    
    // Generate multiple proofs
    const ages = [25, 30, 35];
    const proofPromises = ages.map(async (age) => 
      privacy.prove('range', { value: age, min: 18, max: 100 })
    );
    
    const proofs = await Promise.all(proofPromises);
    console.log('All proofs generated:', proofs);
  } catch (error) {
    console.error('Batch operation failed:', error);
  }
}

batchOperations();
```

## Troubleshooting

### Common Issues

**"Invalid API key" Error**
- Make sure your API key is correct and not expired
- Check that you're using the right API key for the environment (sandbox vs production)
- Ensure there are no extra spaces or characters in your API key

**"Insufficient credits" Error**
- Check your account balance: `await privacy.getBalance()`
- Add more credits to your account at https://dashboard.arcium-privacy.com
- Review your usage: `await privacy.getUsage()`

**Zero-Knowledge Proof Generation Takes Too Long**
- Complex proofs take more time to generate
- Consider using simpler circuits for faster performance
- Generate proofs in advance when possible

**"Proof verification failed" Error**
- Ensure the proof was generated correctly
- Check that you're using the same parameters for verification
- Verify the proof format matches what's expected

### Enabling Debug Mode

To get more detailed error information:

```javascript
const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key',
  debug: true
});
```

## Support

For support, please use the following resources:

- **Documentation**: [docs.arcium.io](https://docs.arcium.io)
- **GitHub Issues**: [github.com/arcium/privacy-sdk/issues](https://github.com/arcium/privacy-sdk/issues)
- **Discord**: [discord.arcium.io](https://discord.arcium.io)
- **Email**: [support@arcium.io](mailto:support@arcium.io)

For security issues, please contact [security@arcium.io](mailto:security@arcium.io).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.