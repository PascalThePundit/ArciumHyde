# Onboarding Flow

This guide provides a complete onboarding experience for new developers integrating Arcium Privacy into their applications.

## Step 1: Account Setup (2 minutes)

### Sign Up
1. Visit [arcium-privacy.com/signup](https://arcium-privacy.com/signup)
2. Provide your email and create an account
3. Verify your email address
4. Choose your plan (Free for testing, paid for production)

### Get Your API Key
```typescript
// Your API key will be displayed after account verification
const API_KEY = 'sk_live_your-api-key-here';
```

### Set Up Development Environment
```bash
# Install the Arcium Privacy SDK
npm install @arcium/privacy-sdk
# or
yarn add @arcium/privacy-sdk
```

## Step 2: Hello World Example (5 minutes)

Let's start with a simple example that demonstrates basic encryption:

```typescript
// Import the Arcium Privacy SDK
import { ArciumPrivacy } from '@arcium/privacy-sdk';

// Initialize with your API key
const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.arcium-privacy.com'
});

// Create a simple encryption/decryption example
async function helloPrivacy() {
  console.log('🔐 Arcium Privacy Hello World!');
  
  // 1. Encrypt some data
  const originalData = 'Hello, privacy world!';
  const password = 'my-security-password';
  
  const encrypted = await privacy.encrypt(originalData, password);
  console.log('✅ Data encrypted:', encrypted);
  
  // 2. Decrypt the data
  const decrypted = await privacy.decrypt(encrypted, password);
  console.log('✅ Data decrypted:', decrypted);
  
  // 3. Verify they match
  console.log('✅ Encryption/Decryption successful:', originalData === decrypted);
  
  return { encrypted, decrypted };
}

// Run the example
helloPrivacy().catch(console.error);
```

## Step 3: Understanding Zero-Knowledge Proofs (8 minutes)

Zero-knowledge proofs allow verification without revealing private information:

```typescript
async function zeroKnowledgeDemo() {
  console.log('\n🔑 Zero-Knowledge Proofs Demo');
  
  // Prove that a value is within a range without revealing the exact value
  const ageProof = await privacy.prove('range', {
    value: 25,  // Private value - stays secret
    min: 18,    // Minimum requirement
    max: 100    // Maximum reasonable value
  });
  
  console.log('✅ Age range proof generated:', ageProof);
  
  // Verify the proof (anyone can do this without knowing the exact age)
  const isValid = await privacy.verify(ageProof);
  console.log('✅ Proof is valid:', isValid);
  
  return { ageProof, isValid };
}

// Run the demo
zeroKnowledgeDemo().catch(console.error);
```

## Step 4: Building Your First Application (12 minutes)

Let's build a simple application that combines multiple privacy features:

```typescript
// User verification service
class PrivacyUserService {
  private privacy: ArciumPrivacy;
  
  constructor(apiKey: string) {
    this.privacy = new ArciumPrivacy({
      apiKey,
      baseUrl: 'https://api.arcium-privacy.com'
    });
  }
  
  // Verify user is eligible (age, location, etc.) without revealing details
  async verifyUserEligibility(age: number, location: string) {
    console.log('\n📋 User Eligibility Verification');
    
    // 1. Age verification (without revealing exact age)
    const ageProof = await this.privacy.prove('range', {
      value: age,
      min: 18,
      max: 100
    });
    
    // 2. Location verification (simplified example)
    const locationEncrypted = await this.privacy.encrypt(location, 'location-key');
    
    // 3. Verify age proof
    const isAgeValid = await this.privacy.verify(ageProof);
    
    console.log(`✅ User is ${isAgeValid ? '' : 'NOT '}age-verified`);
    console.log('🔒 Location encrypted for privacy');
    
    return {
      ageVerified: isAgeValid,
      locationEncrypted: !!locationEncrypted,
      canAccessService: isAgeValid
    };
  }
  
  // Store user data privately
  async storePrivateUserData(userData: any) {
    console.log('\n💾 Storing Private User Data');
    
    // Encrypt sensitive user data
    const password = this.generateSecurePassword();
    const encryptedData = await this.privacy.encrypt(
      JSON.stringify(userData),
      password
    );
    
    console.log('✅ User data encrypted and stored privately');
    
    // In a real app, you'd store encryptedData and password separately
    return {
      encryptedData,
      passwordHint: 'Password stored securely' // In real app, store separately
    };
  }
  
  // Generate secure password for encryption
  private generateSecurePassword(): string {
    // In production, use proper crypto random generation
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Example usage
async function applicationDemo() {
  const userService = new PrivacyUserService('your-api-key-here');
  
  // Verify user eligibility
  const eligibility = await userService.verifyUserEligibility(28, 'San Francisco');
  console.log('Final eligibility result:', eligibility);
  
  // Store private user data
  const userData = {
    preferences: ['technology', 'privacy'],
    subscription: 'premium',
    joinedDate: new Date().toISOString()
  };
  
  const storedData = await userService.storePrivateUserData(userData);
  console.log('Data stored:', { hasEncryptedData: !!storedData.encryptedData });
}

// Run application demo
applicationDemo().catch(console.error);
```

## Step 5: Performance Optimization (5 minutes)

Learn how to optimize your privacy operations for better performance:

```typescript
async function performanceDemo() {
  console.log('\n⚡ Performance Optimization Demo');
  
  // 1. Initialize lazy decryption for performance
  const lazyDecryptor = privacy.initLazyDecryption();
  
  // 2. Create multiple encrypted items
  const items = [
    'private data 1',
    'private data 2', 
    'private data 3',
    'private data 4',
    'private data 5'
  ];
  
  // 3. Encrypt all items
  const encryptedItems = [];
  for (const item of items) {
    encryptedItems.push({
      id: `item-${Date.now()}-${Math.random()}`,
      data: await privacy.encrypt(item, 'password')
    });
  }
  
  console.log(`✅ Created ${encryptedItems.length} encrypted items`);
  
  // 4. Decrypt on demand with caching
  for (const item of encryptedItems) {
    const decrypted = await privacy.decryptOnDemand(
      item.data,
      'password',
      lazyDecryptor
    );
    console.log(`Decrypted: ${decrypted.substring(0, 15)}...`);
  }
  
  console.log('✅ Used lazy decryption for better performance');
}

// Run performance demo
performanceDemo().catch(console.error);
```

## Step 6: Integration with Your Application (3 minutes)

Here's how to integrate Arcium Privacy into different types of applications:

### Web Application Integration
```typescript
// For React/Vue applications
import { ArciumPrivacy } from '@arcium/privacy-sdk';

// Initialize once in your application
const privacy = new ArciumPrivacy({
  apiKey: process.env.REACT_APP_ARCIUM_API_KEY
});

// Use in your components
function UserProfile({ userData }) {
  const [encryptedData, setEncryptedData] = useState(null);
  
  const handleEncrypt = async () => {
    const encrypted = await privacy.encrypt(
      JSON.stringify(userData), 
      'user-password'
    );
    setEncryptedData(encrypted);
  };
  
  return (
    <div>
      <button onClick={handleEncrypt}>Encrypt Profile</button>
      {encryptedData && <p>🔒 Data securely encrypted</p>}
    </div>
  );
}
```

### Backend Service Integration
```typescript
// For Node.js backend services
const express = require('express');
const { ArciumPrivacy } = require('@arcium/privacy-sdk');

const app = express();
const privacy = new ArciumPrivacy({
  apiKey: process.env.ARCIUM_API_KEY
});

app.use(express.json());

// API endpoint for privacy operations
app.post('/api/encrypt', async (req, res) => {
  try {
    const { data, password } = req.body;
    
    if (!data || !password) {
      return res.status(400).json({ error: 'Data and password required' });
    }
    
    const encrypted = await privacy.encrypt(data, password);
    res.json({ encrypted });
  } catch (error) {
    console.error('Encryption failed:', error);
    res.status(500).json({ error: 'Encryption failed' });
  }
});
```

## Step 7: Common Use Cases (5 minutes)

### Financial Application - Loan Eligibility
```typescript
async function loanEligibilityDemo() {
  console.log('\n🏦 Loan Eligibility Verification');
  
  // User proves they earn above $50k without revealing exact salary
  const incomeProof = await privacy.prove('range', {
    value: 75000,  // Private value
    min: 50000,    // Loan requirement
    max: 500000    // Reasonable upper bound
  });
  
  const isValid = await privacy.verify(incomeProof);
  console.log(`✅ Income verification: ${isValid ? 'Approved' : 'Rejected'}`);
  
  return isValid;
}
```

### Healthcare Application - Medical Records
```typescript
async function medicalPrivacyDemo() {
  console.log('\n🏥 Medical Privacy Demo');
  
  // Patient medical data
  const medicalData = {
    conditions: ['diabetes', 'hypertension'],
    medications: ['metformin', 'lisinopril'],
    allergies: ['penicillin']
  };
  
  // Encrypt medical data
  const encryptionPassword = 'patient-unique-key';
  const encryptedMedical = await privacy.encrypt(
    JSON.stringify(medicalData),
    encryptionPassword
  );
  
  console.log('✅ Medical records encrypted');
  console.log('🔒 Patient privacy maintained');
  
  return encryptedMedical;
}
```

## Step 8: Error Handling and Debugging (2 minutes)

Proper error handling for robust applications:

```typescript
async function robustPrivacyOperation() {
  try {
    const result = await privacy.encrypt('sensitive data', 'password');
    return result;
  } catch (error) {
    console.error('Privacy operation failed:', error.message);
    
    // Handle specific error types
    switch (error.code) {
      case 'INVALID_API_KEY':
        console.error('Please check your API key configuration');
        break;
      case 'ENCRYPTION_FAILED':
        console.error('Encryption failed - check input data');
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.error('Rate limit reached - consider upgrading plan');
        break;
      default:
        console.error('Unknown error occurred:', error.message);
    }
    
    throw error; // Re-throw or handle as appropriate
  }
}
```

## Step 9: Security Best Practices (3 minutes)

Implement security best practices from the start:

```typescript
// Security best practices
class SecurePrivacyHandler {
  private privacy: ArciumPrivacy;
  
  constructor(apiKey: string) {
    // Validate API key format
    if (!apiKey || !apiKey.startsWith('sk_')) {
      throw new Error('Invalid API key format');
    }
    
    this.privacy = new ArciumPrivacy({ apiKey });
  }
  
  // Secure password generation
  private generateSecurePassword(): string {
    // Use crypto for production
    return require('crypto').randomBytes(32).toString('hex');
  }
  
  // Input validation
  private validateInput(data: any): boolean {
    if (!data) return false;
    if (typeof data !== 'string' && typeof data !== 'object') return false;
    if (JSON.stringify(data).length > 1000000) return false; // 1MB limit
    return true;
  }
  
  // Secure encrypt with validation
  async secureEncrypt(data: any) {
    if (!this.validateInput(data)) {
      throw new Error('Invalid input data');
    }
    
    const password = this.generateSecurePassword();
    const encrypted = await this.privacy.encrypt(data, password);
    
    // Log securely without revealing data
    console.log('Data encrypted successfully');
    
    return { encrypted, password }; // Return separately in real app
  }
}
```

## Step 10: Next Steps and Resources (1 minute)

Congratulations! You've completed the Arcium Privacy onboarding flow. Here's what to do next:

### Immediate Next Steps
1. **Explore the Playground** - Test features interactively at [arcium-privacy.com/playground](https://arcium-privacy.com/playground)
2. **Review Tutorials** - Deep dive into specific use cases
3. **Check API Reference** - Complete method documentation
4. **Join Community** - Get help in [Discord](https://discord.gg/arcium)

### Production Preparation Checklist
- [ ] Implement proper API key management
- [ ] Add comprehensive error handling
- [ ] Set up monitoring and logging
- [ ] Review security best practices
- [ ] Test performance with realistic data volumes
- [ ] Plan for rate limits and scaling
- [ ] Set up audit logging for compliance

### Common Integration Patterns
- User authentication with privacy
- Financial data verification
- Healthcare record management
- Supply chain provenance
- Identity verification

### Advanced Features to Explore
- Composability framework for complex workflows
- Cross-protocol privacy bridges
- Plugin architecture for custom features
- Selective disclosure for credentials

### Support Resources
- [Documentation](https://docs.arcium-privacy.com) - Complete guides
- [API Reference](https://api.arcium-privacy.com) - Method details
- [Community](https://discord.gg/arcium) - Developer support
- [Status Page](https://status.arcium-privacy.com) - Service status
- [Contact Support](mailto:support@arcium-privacy.com) - Direct help

---

You've successfully completed the Arcium Privacy onboarding! Your integration is set up and ready to provide world-class privacy features to your users. Continue with the [Tutorials](./tutorials.md) to dive deeper into specific use cases.