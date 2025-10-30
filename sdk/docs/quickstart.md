# Quick Start Guide

Get started with the Arcium Privacy SDK in less than 5 minutes! This guide will walk you through the basics of using the SDK to add privacy features to your application.

## Prerequisites

- Node.js 12+ or a modern web browser
- An Arcium Privacy API key (sign up at [dashboard.arcium-privacy.com](https://dashboard.arcium-privacy.com))

## Installation

Install the SDK using npm or yarn:

```bash
npm install @arcium/privacy-sdk
# or
yarn add @arcium/privacy-sdk
```

## Step 1: Initialize the SDK

First, import and initialize the SDK with your API key:

```javascript
import ArciumPrivacy from '@arcium/privacy-sdk';

// Initialize with your API key
const privacy = new ArciumPrivacy({
  apiKey: 'YOUR_API_KEY_HERE',
  // baseUrl is optional, defaults to production API
});
```

## Step 2: Encrypt Data

Encrypt sensitive data with a simple password:

```javascript
// Encrypt a string
const sensitiveData = 'This is confidential information';
const password = 'my-secure-password';

const encrypted = await privacy.encrypt(sensitiveData, password);
console.log('Encrypted:', encrypted);
```

## Step 3: Decrypt Data

Decrypt the data using the same password:

```javascript
// Decrypt the data
const decrypted = await privacy.decrypt(encrypted.encryptedData, password);
console.log('Decrypted:', decrypted); // 'This is confidential information'
```

## Step 4: Generate Zero-Knowledge Proofs

Prove facts about your data without revealing the underlying information:

```javascript
// Prove that a value is within a range (e.g., age verification)
const ageProof = await privacy.prove('range', { 
  value: 25,  // person's age (kept private)
  min: 18,    // minimum required age
  max: 100    // maximum possible age
});

console.log('Age proof generated:', ageProof);

// Verify the proof (anyone can do this)
const isValid = await privacy.verify(ageProof);
console.log('Proof is valid:', isValid); // true
```

## Step 5: Create Verifiable Claims

Create claims that can be selectively disclosed:

```javascript
// Issue a claim about user's age
const ageClaim = await privacy.issueClaim({
  type: 'age_verification',
  subject: 'user-123',
  attributes: { age: 25 },  // This stays private
  disclosurePolicy: {
    public: [],  // Nothing public
    conditional: [{  // Conditional access
      attribute: 'age',
      condition: 'age >= 18',  // Can prove they're 18+
      requiredBy: ['service-b']  // Only these verifiers can access
    }],
    private: ['age']  // Keep age private
  }
});

console.log('Age claim issued:', ageClaim);
```

## Complete Working Example

Here's a complete example that demonstrates all the main features:

```javascript
import ArciumPrivacy from '@arcium/privacy-sdk';

async function runQuickstart() {
  // Initialize the SDK
  const privacy = new ArciumPrivacy({
    apiKey: 'YOUR_API_KEY_HERE'
  });

  console.log('🔍 Arcium Privacy SDK Quickstart');
  console.log('================================');

  // 1. Check service health
  const health = await privacy.healthCheck();
  console.log('✅ Service is healthy:', health.success);

  // 2. Check account balance
  const balance = await privacy.getBalance();
  console.log('💰 Account balance:', balance);

  // 3. Encrypt/Decrypt
  console.log('\n🔐 Encryption Example:');
  const message = 'Secret message that should be protected';
  const password = 'my-password-123';

  const encrypted = await privacy.encrypt(message, password);
  console.log('Encrypted message');

  const decrypted = await privacy.decrypt(encrypted.encryptedData, password);
  console.log('Decrypted message:', decrypted);

  // 4. Zero-Knowledge Proofs
  console.log('\n🔍 Zero-Knowledge Proof Example:');
  const age = 25;

  // Generate proof that age is between 18 and 100
  const ageProof = await privacy.prove('range', { 
    value: age, 
    min: 18, 
    max: 100 
  });
  console.log('Generated age proof');

  // Verify the proof
  const isValid = await privacy.verify(ageProof);
  console.log('Proof is valid:', isValid);

  // 5. Verifiable Claims
  console.log('\n📋 Verifiable Claims Example:');
  
  // Issue a credit score claim
  const creditClaim = await privacy.issueClaim({
    type: 'credit_score_verification',
    subject: 'user-456',
    attributes: { score: 750 },
    disclosurePolicy: {
      public: [],
      private: ['score']
    }
  });
  console.log('Issued credit score claim');

  // Create a disclosure request
  const request = await privacy.createDisclosureRequest({
    verifier: 'bank-service',
    requestedClaims: [{
      type: 'credit_score_verification',
      requiredAttributes: ['score']
    }],
    justification: 'Credit check required for loan application'
  });
  console.log('Created disclosure request');

  // Respond to the request
  const response = await privacy.respondToDisclosureRequest(request, [creditClaim]);
  console.log('Created disclosure response');

  // Verify the response
  const responseValid = await privacy.verifyDisclosure(response, request);
  console.log('Disclosure response is valid:', responseValid);

  console.log('\n🎉 Quickstart completed successfully!');
  console.log('Your application now has privacy features!');

  return { encrypted, ageProof, creditClaim, request, response };
}

// Run the quickstart
runQuickstart()
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

## Next Steps

1. **Review the API Reference** - Detailed documentation of all available methods
2. **Explore Examples** - More complex use cases in the examples directory
3. **Check Usage** - Monitor your API usage and balance
4. **Build with Privacy** - Integrate privacy into your own applications

### Running the Example

To run the quickstart example:

1. Create a new file called `quickstart-demo.js`
2. Copy the complete example above into the file
3. Replace `'YOUR_API_KEY_HERE'` with your actual API key
4. Run the file:

```bash
node quickstart-demo.js
```

## Troubleshooting

### Common Issues

**API Key Required Error**
- Ensure you've set your API key correctly
- Check for typos or extra spaces in your key

**Insufficient Credits**
- Check your balance with `await privacy.getBalance()`
- Add more credits at the Arcium dashboard

**Network Errors**
- Verify internet connectivity
- Check that the API URL is accessible

### Getting Help

- Check the [Troubleshooting Guide](./troubleshooting.md)
- Visit our [Discord Community](https://discord.arcium.io)
- Open an issue on [GitHub](https://github.com/arcium/privacy-sdk/issues)

## What's Next?

Now that you've completed the quickstart, explore:

- [Advanced Examples](./advanced-examples.md) - Complex privacy patterns
- [Integration Patterns](./integration-patterns.md) - How to integrate with your existing systems  
- [Performance Tips](./performance-tips.md) - Optimizing privacy operations
- [Security Best Practices](./security-best-practices.md) - Keeping data secure

Continue to build privacy-first applications that protect your users while providing great functionality!