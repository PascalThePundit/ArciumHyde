# Tutorials

Step-by-step guides to implement specific privacy features in your applications.

## Tutorial 1: Basic Encryption & Decryption

Learn how to encrypt and decrypt sensitive data with Arcium Privacy.

### Prerequisites
- Node.js 14+ installed
- Arcium Privacy SDK installed
- Valid API key

### Step 1: Setup

Install the SDK and initialize:

```bash
npm install @arcium/privacy-sdk
```

```typescript
import { ArciumPrivacy } from '@arcium/privacy-sdk';

const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.arcium-privacy.com'
});
```

### Step 2: Encrypt Data

```typescript
async function encryptUserData() {
  try {
    // Data to encrypt
    const sensitiveData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      ssn: '123-45-6789'
    };

    // Encrypt the data
    const encrypted = await privacy.encrypt(
      JSON.stringify(sensitiveData),
      'user-provided-password'
    );

    console.log('Data encrypted successfully');
    console.log('Encrypted data:', encrypted);

    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw error;
  }
}
```

### Step 3: Decrypt Data

```typescript
async function decryptUserData(encryptedData: any) {
  try {
    // Decrypt the data
    const decryptedString = await privacy.decrypt(
      encryptedData,
      'user-provided-password'
    );

    const decryptedData = JSON.parse(decryptedString);

    console.log('Data decrypted successfully');
    console.log('Decrypted data:', decryptedData);

    return decryptedData;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
}
```

### Step 4: Complete Example

```typescript
async function runEncryptionTutorial() {
  console.log('Starting encryption tutorial...');

  // Encrypt data
  const encryptedData = await encryptUserData();
  
  // Wait a moment to simulate storage/retrieval
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Decrypt data
  const decryptedData = await decryptUserData(encryptedData);

  console.log('Tutorial completed successfully!');
  console.log('Original and decrypted data match:', 
    JSON.stringify(decryptedData) === JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      ssn: '123-45-6789'
    })
  );
}

// Run the tutorial
runEncryptionTutorial().catch(console.error);
```

## Tutorial 2: Zero-Knowledge Proofs for Age Verification

Learn how to prove age requirements without revealing exact age.

### Step 1: Generate Range Proof

```typescript
async function proveAgeRange() {
  try {
    // Prove that age is between 18 and 100 without revealing exact age
    const ageProof = await privacy.prove('range', {
      value: 25,    // Actual age (kept private)
      min: 18,      // Minimum required age
      max: 100      // Maximum reasonable age
    });

    console.log('Age range proof generated:', ageProof);
    return ageProof;
  } catch (error) {
    console.error('Age proof generation failed:', error);
    throw error;
  }
}
```

### Step 2: Verify Age Proof

```typescript
async function verifyAgeProof(proof: any) {
  try {
    const isValid = await privacy.verify(proof);
    console.log('Age proof is valid:', isValid);
    return isValid;
  } catch (error) {
    console.error('Age proof verification failed:', error);
    throw error;
  }
}
```

### Step 3: Complete Age Verification

```typescript
async function ageVerificationDemo() {
  console.log('Starting age verification demo...');

  // Prove age (user side)
  const ageProof = await proveAgeRange();

  // Verify age (service side)
  const isValid = await verifyAgeProof(ageProof);

  if (isValid) {
    console.log('✅ User is verified as being between 18 and 100 years old');
    console.log('Note: Exact age remains private');
  } else {
    console.log('❌ Age verification failed');
  }

  return { proof: ageProof, isValid };
}

// Run the demo
ageVerificationDemo().catch(console.error);
```

## Tutorial 3: Selective Disclosure for Professional Credentials

Learn how to verify credentials without revealing all information.

### Step 1: Issue a Verifiable Credential

```typescript
async function issueProfessionalCredential() {
  try {
    // Issue a university degree credential
    const degreeCredential = await privacy.issueClaim({
      type: 'university_degree',
      subject: 'student-id-123',
      attributes: {
        name: 'John Doe',
        degree: 'Computer Science',
        graduationYear: 2020,
        institution: 'Example University',
        gpa: 3.8
      },
      disclosurePolicy: {
        public: ['graduationYear', 'institution'],    // Always visible
        private: ['name', 'degree', 'gpa']           // Revealed selectively
      }
    });

    console.log('Professional credential issued:', degreeCredential);
    return degreeCredential;
  } catch (error) {
    console.error('Credential issuance failed:', error);
    throw error;
  }
}
```

### Step 2: Request Specific Attributes

```typescript
async function createDisclosureRequest() {
  try {
    // Employer requests degree verification without GPA
    const request = await privacy.createDisclosureRequest({
      verifier: 'employer-id-456',
      requestedClaims: [{
        type: 'university_degree',
        requiredAttributes: ['degree', 'graduationYear', 'institution']
      }],
      justification: 'Position requires computer science degree from 2020 or later'
    });

    console.log('Disclosure request created:', request);
    return request;
  } catch (error) {
    console.error('Disclosure request creation failed:', error);
    throw error;
  }
}
```

### Step 3: Respond to Disclosure Request

```typescript
async function respondToRequest(credential: any, request: any) {
  try {
    // User responds with requested attributes
    const response = await privacy.respondToDisclosureRequest(
      request,
      [credential]
    );

    console.log('Disclosure response created:', response);
    return response;
  } catch (error) {
    console.error('Disclosure response failed:', error);
    throw error;
  }
}
```

### Step 4: Verify Response

```typescript
async function verifyResponse(response: any, request: any) {
  try {
    const isValid = await privacy.verifyDisclosure(response, request);
    console.log('Disclosure response is valid:', isValid);
    return isValid;
  } catch (error) {
    console.error('Disclosure verification failed:', error);
    throw error;
  }
}
```

### Step 5: Complete Credential Verification

```typescript
async function credentialVerificationDemo() {
  console.log('Starting credential verification demo...');

  // Step 1: Issue credential (university side)
  const credential = await issueProfessionalCredential();

  // Step 2: Create request (employer side)
  const request = await createDisclosureRequest();

  // Step 3: Respond to request (user side)
  const response = await respondToRequest(credential, request);

  // Step 4: Verify response (employer side)
  const isValid = await verifyResponse(response, request);

  if (isValid) {
    console.log('✅ Credential verified!');
    console.log('The user has a Computer Science degree from Example University, graduated in 2020');
    console.log('GPA remains private as requested');
  } else {
    console.log('❌ Credential verification failed');
  }

  return { credential, request, response, isValid };
}

// Run the demo
credentialVerificationDemo().catch(console.error);
```

## Tutorial 4: Performance-Optimized Data Handling

Learn how to implement lazy decryption for better performance.

### Step 1: Initialize Lazy Decryption

```typescript
async function setupLazyDecryption() {
  try {
    // Initialize lazy decryption cache with 1-hour TTL
    const lazyDecryptor = privacy.initLazyDecryption(3600000);

    console.log('Lazy decryption system initialized');
    return lazyDecryptor;
  } catch (error) {
    console.error('Lazy decryption setup failed:', error);
    throw error;
  }
}
```

### Step 2: Decrypt on Demand

```typescript
async function decryptOnDemandExample(encryptedData: any, cache: any) {
  try {
    // Decrypt only when needed
    const decrypted = await privacy.decryptOnDemand(
      encryptedData,
      'password',
      cache
    );

    console.log('Data decrypted on demand:', decrypted.substring(0, 50) + '...');
    return decrypted;
  } catch (error) {
    console.error('On-demand decryption failed:', error);
    throw error;
  }
}
```

### Step 3: Batch Decryption

```typescript
async function batchDecryptionExample(encryptedList: any[], cache: any) {
  try {
    // Decrypt multiple items efficiently
    const results = await privacy.decryptBatchLazy(
      encryptedList,
      'password',
      cache
    );

    console.log('Batch decryption completed:', Object.keys(results).length, 'items');
    return results;
  } catch (error) {
    console.error('Batch decryption failed:', error);
    throw error;
  }
}

// Complete performance demo
async function performanceDemo() {
  console.log('Starting performance optimization demo...');

  // Create some test encrypted data
  const testData = ['data1', 'data2', 'data3', 'data4', 'data5'];
  const encryptedList = [];

  for (const data of testData) {
    const encrypted = await privacy.encrypt(data, 'password');
    encryptedList.push({ id: `id-${data}`, data: encrypted });
  }

  // Initialize lazy decryption
  const cache = await setupLazyDecryption();

  // Decrypt on demand
  const firstDecrypted = await decryptOnDemandExample(encryptedList[0].data, cache);

  // Batch decrypt remaining
  const batchResults = await batchDecryptionExample(encryptedList.slice(1), cache);

  console.log('Performance demo completed!');
  console.log('First item decrypted on demand:', firstDecrypted);
  console.log('Batch results count:', Object.keys(batchResults).length);

  return { first: firstDecrypted, batch: batchResults };
}

// Run performance demo
performanceDemo().catch(console.error);
```

## Tutorial 5: Composable Privacy Workflows

Learn how to combine privacy primitives into complex workflows.

### Step 1: Get the Composability Engine

```typescript
function getComposabilityEngine() {
  const engine = privacy.getComposabilityEngine();
  console.log('Composability engine ready');
  return engine;
}
```

### Step 2: Create a Complex Workflow

```typescript
async function createPrivacyWorkflow() {
  const engine = getComposabilityEngine();

  // Example: Encrypt data and generate range proof about the data
  // In a real implementation, you would register custom operations
  console.log('Privacy workflow framework ready');
  
  // This is a conceptual example - the actual implementation would depend
  // on registered privacy primitives in the system
  return engine;
}
```

### Step 3: Execute Workflow

```typescript
async function executePrivacyWorkflow(engine: any) {
  try {
    // Execute the workflow with input data
    const result = await engine.executeWorkflow('example-workflow', {
      // Initial input for the workflow
      data: 'sensitive information',
      password: 'encryption password',
      min: 0,
      max: 100
    });

    console.log('Privacy workflow executed:', result);
    return result;
  } catch (error) {
    console.error('Workflow execution failed:', error);
    throw error;
  }
}

// Complete compossability demo
async function composabilityDemo() {
  console.log('Starting composability demo...');

  const engine = await createPrivacyWorkflow();
  const result = await executePrivacyWorkflow(engine);

  console.log('Composability demo completed!');
  return result;
}
```

## Complete Integration Example

Here's a complete example combining several privacy features:

```typescript
class PrivacyDemoApp {
  private privacy: ArciumPrivacy;

  constructor(apiKey: string) {
    this.privacy = new ArciumPrivacy({
      apiKey,
      baseUrl: 'https://api.arcium-privacy.com'
    });
  }

  async runCompleteDemo() {
    console.log('🧪 Running complete privacy demo...\n');

    // 1. Age verification (ZK proof)
    console.log('1. Verifying age requirement...');
    const ageProof = await this.privacy.prove('range', {
      value: 28,
      min: 18,
      max: 100
    });
    const isAgeValid = await this.privacy.verify(ageProof);
    console.log(`   Age verification: ${isAgeValid ? '✅' : '❌'}\n`);

    // 2. Encrypt sensitive data
    console.log('2. Encrypting sensitive user data...');
    const sensitiveData = {
      name: 'Jane Smith',
      email: 'jane@example.com',
      salary: 75000
    };
    const encrypted = await this.privacy.encrypt(
      JSON.stringify(sensitiveData),
      'secure-password'
    );
    console.log('   Data encrypted successfully\n');

    // 3. Issue a credential
    console.log('3. Issuing employment verification credential...');
    const employmentCredential = await this.privacy.issueClaim({
      type: 'employment_verification',
      subject: 'employee-id-789',
      attributes: {
        name: 'Jane Smith',
        employer: 'Tech Corp',
        position: 'Software Engineer',
        salary: 75000,
        startDate: '2020-01-15'
      },
      disclosurePolicy: {
        public: ['employer', 'startDate'],
        private: ['name', 'position', 'salary']
      }
    });
    console.log('   Credential issued successfully\n');

    // 4. Request selective disclosure
    console.log('4. Requesting employment verification...');
    const disclosureRequest = await this.privacy.createDisclosureRequest({
      verifier: 'background-check-company',
      requestedClaims: [{
        type: 'employment_verification',
        requiredAttributes: ['employer', 'position', 'startDate']
      }],
      justification: 'Employment verification for loan application'
    });

    const disclosureResponse = await this.privacy.respondToDisclosureRequest(
      disclosureRequest,
      [employmentCredential]
    );

    const isDisclosurValid = await this.privacy.verifyDisclosure(
      disclosureResponse,
      disclosureRequest
    );
    console.log(`   Employment verification: ${isDisclosurValid ? '✅' : '❌'}\n`);

    // 5. Performance optimization
    console.log('5. Using lazy decryption for performance...');
    const lazyDecryptor = this.privacy.initLazyDecryption();
    const decrypted = await this.privacy.decryptOnDemand(encrypted, 'secure-password', lazyDecryptor);
    console.log('   Data decrypted with caching optimization\n');

    console.log('🎉 Complete privacy demo finished successfully!');
    console.log('All privacy features working together!\n');

    return {
      ageVerified: isAgeValid,
      dataEncrypted: !!encrypted,
      credentialIssued: !!employmentCredential,
      disclosureVerified: isDisclosurValid,
      performanceOptimized: !!decrypted
    };
  }
}

// Run the complete demo
const demoApp = new PrivacyDemoApp('your-api-key');
demoApp.runCompleteDemo().catch(console.error);
```

## Next Steps

After completing these tutorials, you should be able to:

1. **Integrate** privacy features into your applications
2. **Combine** multiple privacy capabilities
3. **Optimize** for performance with caching and lazy loading
4. **Verify** privacy claims without revealing sensitive data
5. **Troubleshoot** common issues

Continue with [Troubleshooting](./troubleshooting.md) to learn how to handle common issues and errors.