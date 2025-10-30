# Interactive Playground

The Arcium Privacy Interactive Playground provides a hands-on environment where you can experiment with privacy features, test code examples, and build workflows in real-time.

## Playground Features

### Live Code Editor
- Write and execute JavaScript/TypeScript code directly in the browser
- Immediate feedback on privacy operations
- Syntax highlighting and error detection
- Built-in Arcium Privacy SDK integration

### Feature Testing Environment
- Test all Arcium Privacy features without setup
- Experiment with parameters and see results instantly
- Compare different approaches and configurations
- Save and share your playground snippets

### Workflow Composer
- Visually compose privacy workflows
- Chain operations together
- See data flow between operations
- Export workflows for use in applications

### Performance Benchmarking
- Compare operations with and without optimization
- Measure encryption/decryption speeds
- Test caching effectiveness
- Benchmark batch operations

## Getting Started

### Access the Playground
Visit [arcium-privacy.com/playground](https://arcium-privacy.com/playground) to access the interactive environment.

### Basic Example
Try this simple encryption example in the playground:

```typescript
// Initialize Arcium Privacy with demo credentials
const privacy = new ArciumPrivacy({
  apiKey: 'demo-key',
  baseUrl: 'https://api.arcium-privacy.com'
});

// Encrypt some data
const sensitiveData = "This is my private information";
const password = "secure-password-123";

// Perform encryption
const encrypted = await privacy.encrypt(sensitiveData, password);

// Display result
console.log("Original:", sensitiveData);
console.log("Encrypted:", encrypted);

// Decrypt back to original
const decrypted = await privacy.decrypt(encrypted, password);
console.log("Decrypted:", decrypted);
```

## Playground Sections

### 1. Basic Operations
Start with fundamental privacy operations:

#### Encryption Example
```typescript
// Basic encryption
const data = "Sensitive information";
const password = "my-password";
const encrypted = await privacy.encrypt(data, password);
const decrypted = await privacy.decrypt(encrypted, password);

console.log({ original: data, decrypted }); // Should match
```

#### Zero-Knowledge Proofs
```typescript
// Prove age range without revealing exact age
const ageProof = await privacy.prove('range', {
  value: 25,  // Private value
  min: 18,
  max: 100
});

const isValid = await privacy.verify(ageProof);
console.log("Age proof valid:", isValid);
```

#### Selective Disclosure
```typescript
// Issue and verify credentials
const credential = await privacy.issueClaim({
  type: 'age_verification',
  subject: 'user-123',
  attributes: { age: 25 },
  disclosurePolicy: {
    public: [],  // Nothing public
    private: ['age']  // Age stays private
  }
});

console.log("Credential issued:", credential);
```

### 2. Performance Optimization
Test performance optimization techniques:

#### Lazy Decryption
```typescript
// Initialize lazy decryption
const lazyDecryptor = privacy.initLazyDecryption();

// Decrypt on demand with caching
const decrypted = await privacy.decryptOnDemand(encryptedData, password, lazyDecryptor);

// Multiple requests will use cache
const decrypted2 = await privacy.decryptOnDemand(encryptedData, password, lazyDecryptor);
```

#### Batch Operations
```typescript
// Batch encryption
const dataBatch = [
  { id: '1', data: 'first sensitive data' },
  { id: '2', data: 'second sensitive data' },
  { id: '3', data: 'third sensitive data' }
];

// Encrypt all at once
const encryptedBatch = await privacy.decryptBatchLazy(dataBatch, password, lazyDecryptor);
console.log("Batch encrypted:", Object.keys(encryptedBatch).length, "items");
```

### 3. Composability Framework
Combine privacy primitives into workflows:

#### Create Simple Workflow
```typescript
// Get the composability engine
const engine = privacy.getComposabilityEngine();

// This is a conceptual example - actual implementation would depend
// on registered privacy primitives in the system
const workflow = engine.createWorkflowFromOperations(
  'demo-workflow',
  'Demo Workflow',
  'Encrypt and prove',
  [
    // Operations would be registered primitives
  ]
);

// Execute workflow
const result = await engine.executeWorkflow('demo-workflow', {
  data: 'sensitive data',
  password: 'password',
  min: 0,
  max: 100
});
```

### 4. Comparison Demonstrations
Compare privacy approaches:

#### With Arcium vs Without
```typescript
// Without privacy (sensitive data exposure)
const userDataWithoutPrivacy = {
  name: 'John Doe',
  age: 25,
  income: 50000,
  medicalHistory: ['diabetes', 'hypertension']
};

// With Arcium Privacy
const encryptedUserData = await privacy.encrypt(
  JSON.stringify(userDataWithoutPrivacy),
  'user-password'
);

// Prove age without revealing exact value
const ageProof = await privacy.prove('range', {
  value: 25,  // Private
  min: 18,
  max: 100
});

// Verify age requirements without seeing actual age
const isValid = await privacy.verify(ageProof);

console.log({
  privacyProtected: isValid,
  dataIsEncrypted: !!encryptedUserData,
  ageIsPrivate: true  // Age is not revealed
});
```

## Playground Tutorials

### Tutorial 1: Age Verification

```typescript
// Step 1: Generate age proof
const age = 28; // This remains private
const rangeProof = await privacy.prove('range', {
  value: age,
  min: 18,
  max: 100
});

// Step 2: Verify the proof
const isValid = await privacy.verify(rangeProof);

// Step 3: Use the verification result
if (isValid) {
  console.log(`✅ User is verified as being between 18 and 100 years old`);
  console.log(`Note: Exact age (${age}) remains private`);
} else {
  console.log(`❌ Age verification failed`);
}
```

### Tutorial 2: Secure Data Storage

```typescript
// Step 1: Prepare sensitive data
const sensitiveInfo = {
  personal: {
    name: 'Alice Johnson',
    email: 'alice@example.com'
  },
  financial: {
    accountBalance: 12500,
    creditScore: 720
  },
  medical: {
    conditions: ['asthma'],
    medications: ['inhaler']
  }
};

// Step 2: Encrypt the data
const password = 'strong-encryption-key';
const encryptedData = await privacy.encrypt(
  JSON.stringify(sensitiveInfo),
  password
);

// Step 3: Decrypt when needed
const decryptedData = await privacy.decrypt(encryptedData, password);
console.log('Data successfully encrypted and decrypted');

// Step 4: Verify data integrity
const original = JSON.stringify(sensitiveInfo);
const recovered = decryptedData;
console.log('Data integrity preserved:', original === recovered);
```

### Tutorial 3: Performance Optimization

```typescript
// Step 1: Create test dataset
const testData = Array.from({ length: 20 }, (_, i) => ({
  id: `item-${i}`,
  data: `sensitive-data-${i}`,
  timestamp: Date.now() + i
}));

// Step 2: Performance test without optimization
const startTime = Date.now();
const unoptimizedResults = [];
for (const item of testData) {
  const encrypted = await privacy.encrypt(item.data, `password-${item.id}`);
  const decrypted = await privacy.decrypt(encrypted, `password-${item.id}`);
  unoptimizedResults.push(decrypted);
}
const unoptimizedTime = Date.now() - startTime;

// Step 3: Performance test with optimization
const lazyDecryptor = privacy.initLazyDecryption();
const optStartTime = Date.now();
const optimizedResults = await privacy.decryptBatchLazy(
  testData.map((item, i) => ({ id: item.id, data: 
    await privacy.encrypt(item.data, `password-${item.id}`)
  })),
  'common-password', // Using same password for demo
  lazyDecryptor
);
const optimizedTime = Date.now() - optStartTime;

// Step 4: Report results
console.log('Performance Comparison:');
console.log(`Without optimization: ${unoptimizedTime}ms`);
console.log(`With optimization: ${optimizedTime}ms`);
console.log(`Improvement: ${Math.round((unoptimizedTime/optimizedTime - 1) * 100)}% faster`);
```

## Playground Tools

### Code Snippet Library
The playground includes a library of common privacy patterns:

- Basic encryption and decryption
- Zero-knowledge proof generation and verification
- Selective disclosure workflows
- Performance optimization patterns
- Error handling examples
- Integration code templates

### Performance Monitor
Real-time performance monitoring for:

- Operation execution times
- Memory usage
- Cache hit ratios
- Network latencies
- Error rates

### Debugging Console
- Live output display
- Error reporting with context
- Performance analytics
- Operation history
- Memory usage tracking

## Sharing and Collaboration

### Save and Share
- Save your playground experiments
- Generate shareable links
- Export code for use in projects
- Share with team members

### Templates
- Start with common patterns
- Industry-specific examples
- Security best practices
- Performance optimization samples

## Best Practices in the Playground

### Security
- Never use real sensitive data in the playground
- Use generated passwords for examples
- Clean up any data after testing
- Don't share API keys in playground code

### Performance
- Test with realistic data sizes
- Measure operation times
- Try optimization techniques
- Compare different approaches

### Learning
- Start with simple examples
- Gradually build complexity
- Experiment with parameters
- Understand the underlying concepts

## Next Steps

After experimenting in the playground:

1. [API Reference](./api-reference.md) - Detailed method documentation
2. [Tutorials](./tutorials.md) - Step-by-step implementation guides
3. [Security Best Practices](./security-best-practices.md) - Production security guidelines
4. [Architecture](./architecture.md) - System design patterns

---

Start exploring the interactive playground at [arcium-privacy.com/playground](https://arcium-privacy.com/playground) to begin experimenting with privacy-preserving features immediately!