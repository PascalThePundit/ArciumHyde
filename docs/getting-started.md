# Getting Started with Arcium Privacy

This guide will help you set up and integrate Arcium Privacy into your application in under 30 minutes.

## Prerequisites

- Node.js 14+ or higher
- A Solana wallet (Phantom, Solflare, etc.)
- Basic knowledge of TypeScript/JavaScript
- An API key from Arcium Privacy (sign up at [arcium-privacy.com](https://arcium-privacy.com))

## Installation

First, install the Arcium Privacy SDK:

```bash
npm install @arcium/privacy-sdk
# or
yarn add @arcium/privacy-sdk
```

## Basic Setup

### 1. Initialize the SDK

```typescript
import { ArciumPrivacy } from '@arcium/privacy-sdk';

// Initialize with your API key
const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.arcium-privacy.com' // or your preferred endpoint
});
```

### 2. Verify the connection

```typescript
// Test the connection
try {
  const status = await privacy.healthCheck();
  console.log('Arcium Privacy service status:', status);
} catch (error) {
  console.error('Failed to connect to Arcium Privacy:', error);
}
```

## Core Operations

### Encryption & Decryption

```typescript
// Encrypt sensitive data
const sensitiveData = "User's personal information";
const password = "strong-password-123";

const encryptedResult = await privacy.encrypt(
  sensitiveData,
  password
);

console.log('Encrypted data:', encryptedResult);

// Decrypt the data
const decryptedData = await privacy.decrypt(
  encryptedResult,
  password
);

console.log('Decrypted data:', decryptedData); // "User's personal information"
```

### Zero-Knowledge Proofs

```typescript
// Generate a range proof (prove a value is between min and max without revealing the value)
const rangeProof = await privacy.prove('range', {
  value: 25,
  min: 18,
  max: 100
});

console.log('Range proof:', rangeProof);

// Verify the proof
const isValid = await privacy.verify(rangeProof);
console.log('Is proof valid?', isValid); // true
```

### Selective Disclosure

```typescript
// Issue a verifiable claim
const claim = await privacy.issueClaim({
  type: 'age_verification',
  subject: 'user-id-123',
  attributes: { age: 25 },
  disclosurePolicy: {
    public: [], // Attributes that are public
    private: ['age'] // Attributes that remain private
  }
});

// Create a disclosure request
const disclosureRequest = await privacy.createDisclosureRequest({
  verifier: 'dapp-id-456',
  requestedClaims: [{
    type: 'age_verification',
    requiredAttributes: ['age']
  }],
  justification: 'Age verification required for service access'
});

// Respond to disclosure request
const disclosureResponse = await privacy.respondToDisclosureRequest(
  disclosureRequest,
  [claim]
);

// Verify the disclosure response
const isDisclosedValid = await privacy.verifyDisclosure(
  disclosureResponse,
  disclosureRequest
);

console.log('Is disclosure valid?', isDisclosedValid);
```

## Performance Optimization Example

```typescript
// Initialize with lazy decryption for better performance
const lazyDecryptor = privacy.initLazyDecryption();

// Decrypt on demand (with caching)
const decrypted = await privacy.decryptOnDemand(
  encryptedData,
  'password',
  lazyDecryptor
);
```

## Composability Example

```typescript
// Get the composability engine
const engine = privacy.getComposabilityEngine();

// Create a simple workflow: encrypt + generate range proof
const workflow = engine.createWorkflowFromOperations(
  'encrypt-and-prove',
  'Encrypt and Prove',
  'Encrypt sensitive data and generate range proof',
  [
    // This would use registered primitives
  ]
);

// Execute the workflow
const result = await engine.executeWorkflow('encrypt-and-prove', {
  data: 'sensitive data',
  password: 'password',
  min: 0,
  max: 100
});
```

## Error Handling

```typescript
try {
  const result = await privacy.encrypt('data', 'password');
  console.log('Success:', result);
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

## Complete Example Application

Here's a complete example of a simple privacy-preserving application:

```typescript
import { ArciumPrivacy } from '@arcium/privacy-sdk';

class PrivacyApp {
  private privacy: ArciumPrivacy;

  constructor(apiKey: string) {
    this.privacy = new ArciumPrivacy({
      apiKey,
      baseUrl: 'https://api.arcium-privacy.com'
    });
  }

  // Function to verify age privately
  async verifyAgePrivately(age: number): Promise<boolean> {
    try {
      // Generate zero-knowledge proof that age is >= 18
      const proof = await this.privacy.prove('range', {
        value: age,
        min: 18,
        max: 100
      });

      // Verify the proof (in a real app, this would be done by a verifier)
      const isValid = await this.privacy.verify(proof);
      
      return isValid;
    } catch (error) {
      console.error('Age verification failed:', error);
      return false;
    }
  }

  // Function to encrypt sensitive user data
  async encryptUserData(userData: any, password: string): Promise<any> {
    try {
      const encrypted = await this.privacy.encrypt(
        JSON.stringify(userData),
        password
      );
      
      return encrypted;
    } catch (error) {
      console.error('Data encryption failed:', error);
      throw error;
    }
  }

  // Function to decrypt sensitive user data
  async decryptUserData(encryptedData: any, password: string): Promise<any> {
    try {
      const decryptedString = await this.privacy.decrypt(encryptedData, password);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Data decryption failed:', error);
      throw error;
    }
  }
}

// Usage
const app = new PrivacyApp('your-api-key');

// Verify age privately
const isAdult = await app.verifyAgePrivately(25);
console.log('Is adult:', isAdult); // true

// Encrypt user data
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25
};

const encryptedData = await app.encryptUserData(userData, 'user-password');
console.log('Data encrypted successfully');

// Decrypt user data
const decryptedData = await app.decryptUserData(encryptedData, 'user-password');
console.log('Decrypted data:', decryptedData);
```

## Next Steps

1. [Core Concepts](./core-concepts.md) - Deep dive into privacy concepts
2. [API Reference](./api-reference.md) - Complete API documentation
3. [Tutorials](./tutorials.md) - Step-by-step guides for specific use cases
4. [Architecture](./architecture.md) - System design and data flow
5. [Interactive Playground](./playground.md) - Test features live

## Troubleshooting

### Common Issues

**Invalid API Key**: Make sure your API key is correctly set and not expired.

**Network Issues**: Verify that your application can reach the Arcium Privacy API endpoints.

**CORS Issues**: When using in browsers, ensure your domain is whitelisted.

### Need Help?

- Check the [Troubleshooting](./troubleshooting.md) section
- Join our [Discord community](https://discord.gg/arcium)
- Open an issue on [GitHub](https://github.com/arcium/privacy/issues)

---

Congratulations! You've successfully integrated Arcium Privacy into your application. Continue with the [Core Concepts](./core-concepts.md) guide to understand the underlying privacy mechanisms.