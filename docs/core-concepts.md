# Core Concepts

This section explains the fundamental privacy concepts implemented in the Arcium Privacy Application and how they work together.

## Zero-Knowledge Proofs (ZKPs)

Zero-knowledge proofs are cryptographic methods that allow one party (the prover) to prove to another party (the verifier) that a statement is true without revealing any information beyond the validity of the statement itself.

### How ZKPs Work in Arcium

Arcium implements several types of zero-knowledge proofs:

### Range Proofs
Prove that a value is within a specific range without revealing the exact value.

```typescript
// Prove that age is between 18 and 100 without revealing exact age
const rangeProof = await privacy.prove('range', {
  value: 25,    // Prover knows this, verifier doesn't
  min: 18,
  max: 100
});

// Anyone can verify the proof without knowing the exact value
const isValid = await privacy.verify(rangeProof);
```

**Use Cases:**
- Age verification (18+ without revealing exact age)
- Income verification (above threshold without revealing amount)
- Credit score validation (above minimum without revealing score)

### Balance Proofs
Prove that a balance meets certain criteria without revealing the exact amount.

```typescript
// Prove that balance is above $1000 without revealing exact amount
const balanceProof = await privacy.prove('balance', {
  balance: 1500,     // Prover knows this, verifier doesn't
  threshold: 1000
});
```

**Use Cases:**
- Account minimum balance requirements
- Loan eligibility verification
- Premium service access

### Benefits of ZKPs
- **Privacy**: No sensitive information revealed
- **Verification**: Mathematical proof of truth
- **Efficiency**: Lightweight verification
- **Scalability**: Proofs can be verified quickly

## Encryption & Decryption

Arcium provides symmetric encryption using industry-standard algorithms with additional privacy-preserving features.

### AES-256 Encryption
Default encryption method providing strong security.

```typescript
const encrypted = await privacy.encrypt(
  'sensitive data',
  'password'
);

const decrypted = await privacy.decrypt(
  encrypted,
  'password'
);
```

### Lazy Decryption
Optimize performance by only decrypting data when needed.

```typescript
// Initialize lazy decryption cache
const lazyDecryptor = privacy.initLazyDecryption();

// Decrypt only when data is accessed
const decrypted = await privacy.decryptOnDemand(
  encryptedData,
  'password',
  lazyDecryptor
);
```

**Benefits:**
- Reduced memory usage
- Faster application performance
- Selective data access

## Selective Disclosure

Selective disclosure allows sharing only specific attributes of private information while keeping the rest confidential.

### Verifiable Credentials
Credentials that can be verified without revealing all contained information.

```typescript
// Issue a verifiable credential
const claim = await privacy.issueClaim({
  type: 'university_degree',
  subject: 'student-id-123',
  attributes: {
    name: 'John Doe',
    degree: 'Computer Science',
    graduationYear: 2020,
    gpa: 3.8
  },
  disclosurePolicy: {
    public: ['graduationYear'],           // Always public
    private: ['name', 'degree', 'gpa']   // Only shared selectively
  }
});

// Request specific attributes
const disclosureRequest = await privacy.createDisclosureRequest({
  verifier: 'employer-id-456',
  requestedClaims: [{
    type: 'university_degree',
    requiredAttributes: ['degree', 'graduationYear']
  }],
  justification: 'Position requires computer science degree'
});
```

### Privacy-Preserving Verification
Verify credentials without accessing all information.

```typescript
// Verify specific attributes without seeing others
const isValid = await privacy.verifyDisclosure(
  disclosureResponse,
  disclosureRequest
);
```

## Composability Framework

The compossability framework allows combining simple privacy primitives into complex workflows.

### Privacy Primitives
Reusable building blocks for privacy operations:

- **Encryption/Decryption**: Data protection
- **Zero-Knowledge Proofs**: Verification without disclosure
- **Selective Disclosure**: Granular information sharing
- **Hash Functions**: Data obfuscation

### Workflow Composition
Chain primitives to create complex privacy workflows:

```typescript
// Compose encryption with proof generation
const engine = privacy.getComposabilityEngine();

// Create a workflow that encrypts and then proves
const workflow = engine.createWorkflowFromOperations(
  'encrypt-and-prove',
  'Encrypt and Prove',
  'Encrypt data and generate range proof',
  [
    // Operations would be registered primitives
  ]
);
```

## Performance Optimization

Arcium implements several performance optimizations to make privacy operations practical:

### Caching
- Encryption result caching
- Decryption result caching
- Proof verification caching

### Batch Operations
- Process multiple operations simultaneously
- Reduce network overhead
- Parallel processing

### Lazy Loading
- Load data on demand
- Preemptive loading for better UX
- Memory-efficient data handling

### WASM Acceleration
- WebAssembly for fast cryptographic operations
- Fallback to JavaScript when WASM not available
- Significantly faster than pure JavaScript

## Reputation System

Privacy-preserving reputation system that allows building trust without revealing sensitive information:

```typescript
// Create privacy-preserving reputation
const reputation = await privacy.createReputation({
  subject: 'user-id-123',
  attributes: {
    // Anonymized trust indicators
    transactionCount: 42,
    successfulVerifications: 38,
    // etc.
  },
  privacySettings: {
    // Control what aspects are publicly visible
    public: ['verificationScore'],
    private: ['individualTransactions']
  }
});
```

## Cross-Protocol Compatibility

Arcium supports privacy operations across different blockchain protocols:

### Protocol Bridges
- Solana to Ethereum privacy operations
- Cross-chain proof verification
- Standardized interfaces

### Interoperability
- Same primitives work across protocols
- Consistent privacy guarantees
- Protocol-specific optimizations

## Security Model

Arcium follows a defense-in-depth security approach:

### Data Protection
- Client-side encryption before transmission
- Secure key derivation
- Minimal data retention

### Privacy Preservation
- Zero-knowledge where possible
- Minimal information disclosure
- Anonymization techniques

### Verification
- Cryptographic proof verification
- Tamper-evident systems
- Audit trails

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │  Arcium SDK     │    │  Arcium API     │
│                 │    │                 │    │                 │
│ • User Interface│───▶│ • Encryption    │───▶│ • Privacy       │
│ • Business Logic│    │ • ZK Proofs     │    │   Operations    │
│ • Data Storage  │    │ • Selective Disc│    │ • Performance   │
│                 │    │ • Composability │    │   Optimization  │
└─────────────────┘    └─────────────────┘    └─────────────────┘

                              │
                              ▼
                    ┌─────────────────┐
                    │  Blockchain     │
                    │  (Solana/Eth)   │
                    │                 │
                    │ • Transaction   │
                    │   Execution     │
                    │ • Smart Contract│
                    │   Integration   │
                    └─────────────────┘
```

## Data Flow

1. **Client Input**: Application sends sensitive data
2. **SDK Processing**: Local privacy operations (encryption, proofs)
3. **API Processing**: Server-side privacy operations
4. **Blockchain**: Transaction execution and verification
5. **Verification**: Proof verification and validation

This architecture ensures that sensitive data is protected at every step while enabling privacy-preserving operations.

---

Continue to [API Reference](./api-reference.md) to learn about all available methods and parameters.