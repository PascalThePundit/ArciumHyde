# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with Arcium Privacy integration.

## Common Issues

### 1. API Key Issues

**Problem:** "Invalid API key" error

**Solutions:**
1. Verify your API key is correct and not expired
2. Check for extra spaces or characters in the API key
3. Ensure you're using the right environment (test vs production)
4. Regenerate the API key if you suspect it's compromised

```typescript
// Correct API key usage
const privacy = new ArciumPrivacy({
  apiKey: 'sk_live_abc123def456...', // No extra spaces
  baseUrl: 'https://api.arcium-privacy.com'
});
```

### 2. Network Connectivity Issues

**Problem:** Network errors when calling Arcium API

**Solutions:**
1. Check internet connectivity
2. Verify that your firewall or network allows connections to Arcium endpoints
3. Add appropriate CORS headers if using in browser
4. Retry with exponential backoff for transient issues

```typescript
// Example with retry logic
async function callWithRetry(operation: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}

// Usage
const encrypted = await callWithRetry(() => 
  privacy.encrypt(data, password)
);
```

### 3. Encryption/Decryption Failures

**Problem:** Encryption or decryption operations fail

**Common Causes and Solutions:**

- **Mismatched passwords**: Ensure the same password is used for encryption and decryption
- **Malformed data**: Validate data is in expected format before encryption
- **Incorrect encryption method**: Use compatible methods for encrypt/decrypt

```typescript
// Correct encryption/decryption pattern
try {
  // Store the password securely, do not hardcode
  const password = getUserPassword();
  
  // Encrypt
  const encrypted = await privacy.encrypt('sensitive data', password);
  
  // Decrypt with same password
  const decrypted = await privacy.decrypt(encrypted, password);
  
  console.log('Encryption/Decryption successful:', decrypted);
} catch (error) {
  console.error('Encryption/Decryption failed:', error.message);
}
```

### 4. Zero-Knowledge Proof Issues

**Problem:** Proof generation or verification fails

**Solutions:**
1. Verify input parameters are within expected ranges
2. Check that required parameters are provided
3. Ensure the proof type is supported

```typescript
// Valid range proof
try {
  // Ensure value is within min/max range
  const proof = await privacy.prove('range', {
    value: 25,    // Must be between min and max
    min: 18,
    max: 100
  });
  
  // Verify the proof
  const isValid = await privacy.verify(proof);
  console.log('Proof is valid:', isValid);
} catch (error) {
  console.error('Proof operation failed:', error.message);
}
```

### 5. Performance Issues

**Problem:** Slow operations or timeouts

**Solutions:**
1. Use lazy decryption for large datasets
2. Implement caching with TTL
3. Batch multiple operations
4. Use performance monitoring to identify bottlenecks

```typescript
// Performance optimization example
const lazyDecryptor = privacy.initLazyDecryption(1800000); // 30 min TTL

// Decrypt on demand with caching
const decrypted = await privacy.decryptOnDemand(
  encryptedData,
  password,
  lazyDecryptor
);

// For multiple items, use batch decryption
const results = await privacy.decryptBatchLazy(
  encryptedList,
  password,
  lazyDecryptor
);
```

## Error Reference

### Common Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `INVALID_API_KEY` | API key is invalid or expired | Verify and update your API key |
| `ENCRYPTION_FAILED` | Encryption operation failed | Check input data and password |
| `DECRYPTION_FAILED` | Decryption operation failed | Verify password and encrypted data |
| `PROOF_GENERATION_FAILED` | Zero-knowledge proof generation failed | Check proof parameters |
| `PROOF_VERIFICATION_FAILED` | Zero-knowledge proof verification failed | Verify proof data integrity |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded | Implement rate limiting or upgrade plan |
| `INSUFFICIENT_CREDITS` | Account credits are insufficient | Add credits to your account |
| `INVALID_INPUT` | Invalid input parameters | Check parameter format and values |
| `NETWORK_ERROR` | Network connectivity issue | Check connectivity and retry |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | Retry later |

### Error Handling Best Practices

```typescript
async function robustPrivacyCall() {
  try {
    const result = await privacy.encrypt('data', 'password');
    return result;
  } catch (error) {
    // Log the error with context
    console.error('Privacy operation failed:', {
      operation: 'encrypt',
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });

    // Handle specific errors appropriately
    switch (error.code) {
      case 'INVALID_API_KEY':
        // Alert user to update API key
        showApiKeyUpdateNotice();
        break;
        
      case 'RATE_LIMIT_EXCEEDED':
        // Implement backoff or queue operation
        await waitForRateLimitReset();
        break;
        
      case 'NETWORK_ERROR':
        // Retry with exponential backoff
        return retryOperation();
        break;
        
      default:
        // Re-throw unexpected errors
        throw error;
    }
  }
}
```

## Debugging Techniques

### 1. Enable Debug Logging

```typescript
// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  // The SDK may provide debug logging options
  // Implementation would depend on specific SDK capabilities
}
```

### 2. Validate Input Data

```typescript
function validateEncryptedData(data: any): boolean {
  // Check for expected properties
  return (
    data &&
    typeof data === 'object' &&
    data.hasOwnProperty('data') &&
    data.hasOwnProperty('salt') &&
    data.hasOwnProperty('iv') &&
    data.hasOwnProperty('method')
  );
}

async function safeDecrypt(encryptedData: any, password: string) {
  if (!validateEncryptedData(encryptedData)) {
    throw new Error('Invalid encrypted data format');
  }
  
  return await privacy.decrypt(encryptedData, password);
}
```

### 3. Performance Monitoring

```typescript
async function monitorPerformance() {
  const startTime = Date.now();
  
  try {
    const result = await privacy.encrypt('test', 'password');
    
    const duration = Date.now() - startTime;
    
    // Log performance metrics
    console.log(`Encryption completed in ${duration}ms`);
    
    // Alert if performance is below threshold
    if (duration > 5000) { // 5 seconds
      console.warn('Encryption operation took longer than expected');
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Operation failed after ${duration}ms:`, error.message);
    throw error;
  }
}
```

## Browser-Specific Issues

### CORS Errors

**Problem:** Cross-Origin Resource Sharing errors in browser

**Solutions:**
1. Ensure your domain is whitelisted in Arcium dashboard
2. Use proper headers for cross-origin requests
3. Consider using a proxy when appropriate

```typescript
// In browser environment, ensure proper CORS configuration
const privacy = new ArciumPrivacy({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.arcium-privacy.com'
});

// The SDK should handle CORS appropriately
// If issues persist, contact Arcium support to whitelist your domain
```

### Content Security Policy Issues

**Problem:** CSP blocking Arcium API calls

**Solutions:**
1. Update CSP headers to allow Arcium endpoints
2. Add appropriate CSP directives

```
# Example CSP header that allows Arcium API
Content-Security-Policy: connect-src https://api.arcium-privacy.com;
```

## Mobile App Specific Issues

### Certificate Pinning

Some mobile environments may require certificate pinning:

```typescript
// Mobile app configuration may need additional security settings
// This is handled by the Arcium mobile SDK
```

### Background Processing

Operations that take time to complete should handle background execution:

```typescript
// Handle app state changes for long-running operations
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // App going to background, handle accordingly
    handleBackgroundExecution();
  } else {
    // App returning to foreground
    handleForegroundResume();
  }
});
```

## Integration Testing

### Mock Testing

```typescript
// Example testing setup
const mockPrivacy = {
  encrypt: async (data: string, password: string) => {
    // Return predictable encrypted data for tests
    return {
      data: `encrypted_${data}`,
      salt: 'mock_salt',
      iv: 'mock_iv',
      method: 'mock_method'
    };
  },
  
  decrypt: async (encryptedData: any, password: string) => {
    // Return predictable decrypted data for tests
    return `decrypted_${encryptedData.data}`.replace('encrypted_', '');
  },
  
  prove: async (type: string, params: any) => {
    // Return mock proof for testing
    return { proof: 'mock-proof', inputs: params };
  },
  
  verify: async (proof: any) => {
    // Return true for valid mock proofs
    return proof.proof.startsWith('mock-');
  }
};

// Use mock in tests instead of real service
async function testPrivacyOperations() {
  const result = await mockPrivacy.encrypt('test', 'password');
  console.assert(result.data === 'encrypted_test', 'Encryption test passed');
}
```

### Performance Testing

```typescript
// Performance testing for privacy operations
async function performanceTest() {
  const iterations = 100;
  const startTime = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    await privacy.encrypt(`test_data_${i}`, 'password');
  }
  
  const totalDuration = Date.now() - startTime;
  const avgDuration = totalDuration / iterations;
  
  console.log(`Average encryption time: ${avgDuration}ms`);
  
  // Performance should be acceptable
  if (avgDuration > 100) { // 100ms threshold
    console.warn(`Performance may be degraded: ${avgDuration}ms average`);
  }
}
```

## Issue Reporting

When reporting issues to Arcium support:

1. **Provide the error message** and error code exactly as received
2. **Include the timestamp** of when the issue occurred
3. **Share the request ID** if available (from response headers)
4. **Describe the expected vs actual behavior**
5. **Include relevant code snippets** (with sensitive data redacted)

```typescript
// Example error report template
const errorReport = {
  timestamp: new Date().toISOString(),
  operation: 'encrypt',
  error: {
    message: error.message,
    code: error.code,
    requestID: error.requestID // if available
  },
  environment: {
    sdkVersion: '1.0.0',
    nodeVersion: process.version,
    os: process.platform
  },
  codeExample: `
    // The code that caused the error
    await privacy.encrypt(sensitiveData, password);
  `
};
```

## Preventive Measures

1. **Implement circuit breakers** for API calls to prevent cascade failures
2. **Use health checks** to monitor service availability
3. **Implement graceful degradation** when privacy features are unavailable
4. **Log operations** for debugging and auditing purposes
5. **Monitor API usage** to avoid rate limits

```typescript
// Example circuit breaker pattern
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private isOpen = false;
  
  async call(operation: () => Promise<any>): Promise<any> {
    if (this.isOpen) {
      if (Date.now() - (this.lastFailureTime || 0) > 60000) { // 1 minute
        // Try to close circuit
        this.isOpen = false;
        this.failureCount = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await operation();
      this.failureCount = 0; // Reset on success
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.failureCount >= 5) {
        this.isOpen = true; // Open circuit after 5 failures
      }
      
      throw error;
    }
  }
}

// Usage
const circuitBreaker = new CircuitBreaker();
const result = await circuitBreaker.call(() => 
  privacy.encrypt(data, password)
);
```

---

If you're unable to resolve an issue using this guide, please contact [Arcium Support](mailto:support@arcium-privacy.com) with the details of your problem.