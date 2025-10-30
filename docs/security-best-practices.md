# Security Best Practices

This guide outlines the security best practices for implementing and using the Arcium Privacy Application.

## Key Management

### API Key Security

**Never hardcode API keys** in your source code:

❌ **Don't:**
```typescript
// Never do this!
const privacy = new ArciumPrivacy({
  apiKey: 'sk_live_abc123def456...', // Hardcoded - DANGEROUS!
  baseUrl: 'https://api.arcium-privacy.com'
});
```

✅ **Do:**
```typescript
// Load API key from environment variables
const privacy = new ArciumPrivacy({
  apiKey: process.env.ARCIUM_API_KEY || throw new Error('API key not configured'),
  baseUrl: process.env.ARCIUM_BASE_URL || 'https://api.arcium-privacy.com'
});
```

### Secure Key Storage

**Server Environment:**
- Store API keys in environment variables
- Use secrets management systems (HashiCorp Vault, AWS Secrets Manager, etc.)
- Never commit keys to version control

**Browser Environment:**
- Do not use API keys directly in client-side code
- Implement server-side proxy for API calls
- Use short-lived tokens when API keys must be exposed

### Key Rotation

- Rotate API keys regularly (recommended: every 3-6 months)
- Implement a key rotation process in your deployment pipeline
- Update keys across all environments simultaneously

```typescript
// Example key rotation helper
async function rotateApiKey(newApiKey: string) {
  // 1. Update in environment/staging
  await updateEnvironmentKey(newApiKey);
  
  // 2. Test with new key
  await testApiKey(newApiKey);
  
  // 3. Update in production
  await updateProductionKey(newApiKey);
  
  // 4. Revoke old key after grace period
  await scheduleOldKeyRevocation();
}
```

## Data Protection

### Encryption Best Practices

**Password Requirements:**
- Use strong, unique passwords for each encryption operation
- Generate passwords with cryptographically secure random generators
- Never reuse the same password for different data sets

```typescript
// Generate strong passwords
function generateSecurePassword(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64'); // 256-bit password
}

// Use different passwords for different data
const personalDataPassword = generateSecurePassword();
const financialDataPassword = generateSecurePassword();

const personalEncrypted = await privacy.encrypt(personalData, personalDataPassword);
const financialEncrypted = await privacy.encrypt(financialData, financialDataPassword);
```

**Data Classification:**
- Classify data by sensitivity level
- Apply appropriate privacy measures based on classification
- Regularly review data classification and security measures

### Zero-Knowledge Proof Security

**Parameter Validation:**
- Always validate proof parameters are within expected ranges
- Verify proof inputs are reasonable for your use case
- Implement checks for proof validity before trusting results

```typescript
// Validate proof parameters
function validateRangeProofParams(params: { value: number, min: number, max: number }): boolean {
  return (
    Number.isInteger(params.value) &&
    Number.isInteger(params.min) &&
    Number.isInteger(params.max) &&
    params.min <= params.value &&
    params.value <= params.max &&
    params.max - params.min <= 1000000 // Reasonable range limit
  );
}

async function safeRangeProof(value: number, min: number, max: number) {
  if (!validateRangeProofParams({ value, min, max })) {
    throw new Error('Invalid range proof parameters');
  }
  
  return await privacy.prove('range', { value, min, max });
}
```

### Selective Disclosure Security

**Disclosure Policy:**
- Carefully consider what information to keep private vs. public
- Regularly review and update disclosure policies
- Implement policy validation to prevent accidental disclosure

```typescript
// Validate disclosure policy
function validateDisclosurePolicy(policy: { public: string[], private: string[] }): boolean {
  const allAttributes = [...policy.public, ...policy.private];
  const uniqueAttributes = new Set(allAttributes);
  
  // Check for duplicates
  return allAttributes.length === uniqueAttributes.size;
}

async function safeIssueClaim(claimData: any) {
  if (!validateDisclosurePolicy(claimData.disclosurePolicy)) {
    throw new Error('Invalid disclosure policy: duplicate attributes');
  }
  
  return await privacy.issueClaim(claimData);
}
```

## Privacy Preservation

### Minimal Information Disclosure

**Principle:** Only disclose the minimum amount of information necessary to achieve the objective.

```typescript
// Good: Only prove what's necessary
const ageProof = await privacy.prove('range', {
  value: userAge,
  min: 18,  // Only prove age >= 18
  max: 100  // Upper limit for reasonableness
});

// Avoid: Providing more information than needed
// Don't include exact age in clear text when a proof suffices
```

### Anonymization Techniques

**Use zero-knowledge whenever possible:**
- Prove without revealing exact values
- Use range proofs instead of exact values
- Implement set membership proofs when appropriate

```typescript
// Instead of revealing exact salary
// const salary = 75000;

// Prove salary is above threshold
const salaryProof = await privacy.prove('range', {
  value: 75000,
  min: 50000,  // Prove salary > 50k
  max: 200000  // Reasonable upper bound
});
```

## Input Validation

### Client-Side Validation

**Always validate user inputs before privacy operations:**

```typescript
function validateUserData(userData: any): boolean {
  return (
    userData &&
    typeof userData === 'object' &&
    userData.name &&
    typeof userData.name === 'string' &&
    userData.name.length <= 100 &&
    userData.email &&
    typeof userData.email === 'string' &&
    isValidEmail(userData.email) &&
    userData.age !== undefined &&
    Number.isInteger(userData.age) &&
    userData.age >= 0 &&
    userData.age <= 150
  );
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function secureProcessUserData(userData: any) {
  if (!validateUserData(userData)) {
    throw new Error('Invalid user data provided');
  }
  
  // Process validated data with privacy operations
  return await privacy.encrypt(JSON.stringify(userData), generateSecurePassword());
}
```

### Server-Side Validation

**Never trust client-side validation alone:**

```typescript
// Server-side validation
app.post('/encrypt-data', async (req, res) => {
  // 1. Validate request
  if (!req.body || !req.body.data) {
    return res.status(400).json({ error: 'Data is required' });
  }
  
  // 2. Validate data format and content
  if (typeof req.body.data !== 'string' || req.body.data.length > 10000) {
    return res.status(400).json({ error: 'Invalid data format or size' });
  }
  
  // 3. Process with privacy operations
  try {
    const encrypted = await privacy.encrypt(req.body.data, req.body.password);
    res.json({ encrypted });
  } catch (error) {
    console.error('Encryption failed:', error);
    res.status(500).json({ error: 'Encryption failed' });
  }
});
```

## Error Handling and Logging

### Secure Error Handling

**Never expose sensitive information in error messages:**

❌ **Don't:**
```typescript
// Exposes sensitive data in error message
try {
  const result = await privacy.encrypt(sensitiveData, password);
} catch (error) {
  // Don't log sensitiveData or password in error
  console.error('Encryption failed for data:', sensitiveData);
  throw error;
}
```

✅ **Do:**
```typescript
try {
  const result = await privacy.encrypt(sensitiveData, password);
} catch (error) {
  // Log only non-sensitive information
  console.error('Encryption failed', {
    timestamp: new Date().toISOString(),
    operation: 'encrypt',
    dataSize: sensitiveData.length
  });
  
  // Provide generic error to user, not specific details
  throw new Error('Encryption operation failed');
}
```

### Secure Logging

```typescript
// Log privacy operations securely
function secureLog(level: string, message: string, meta: any) {
  // Sanitize sensitive data before logging
  const sanitizedMeta = {
    ...meta,
    // Remove or mask sensitive fields
    password: undefined,
    data: meta.data ? '[REDACTED]' : undefined,
    // Log useful non-sensitive information
    dataSize: meta.data?.length,
    operation: meta.operation,
    timestamp: new Date().toISOString()
  };
  
  console.log(`[${level}] ${message}`, sanitizedMeta);
}
```

## Performance Security

### Rate Limiting

**Protect against abuse and DoS attacks:**

```typescript
// Implement rate limiting for privacy operations
const rateLimiter = {
  requests: new Map<string, number>(),
  
  allow(apiKey: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(apiKey) || 0;
    
    // Allow 100 requests per minute per API key
    if (requests >= 100 && now - (this.requests.get(`${apiKey}_timestamp`) || 0) < 60000) {
      return false;
    }
    
    this.requests.set(apiKey, requests + 1);
    if (!this.requests.has(`${apiKey}_timestamp`)) {
      this.requests.set(`${apiKey}_timestamp`, now);
    }
    
    return true;
  }
};

async function securePrivacyOperation(apiKey: string, operation: () => Promise<any>) {
  if (!rateLimiter.allow(apiKey)) {
    throw new Error('Rate limit exceeded');
  }
  
  return await operation();
}
```

### Resource Limits

**Prevent resource exhaustion:**

```typescript
// Validate data size limits
const MAX_DATA_SIZE = 10 * 1024 * 1024; // 10MB limit

function validateDataSize(data: any): boolean {
  const size = JSON.stringify(data).length;
  return size <= MAX_DATA_SIZE;
}

async function secureEncrypt(data: any, password: string) {
  if (!validateDataSize(data)) {
    throw new Error('Data exceeds maximum size limit');
  }
  
  return await privacy.encrypt(data, password);
}
```

## Audit and Compliance

### Audit Trail

**Maintain logs for compliance and security:**

```typescript
interface PrivacyOperationLog {
  id: string;
  timestamp: string;
  userId: string;
  operation: string;
  dataSize: number;
  success: boolean;
  requestId: string;
  metadata: Record<string, any>;
}

class PrivacyAuditLogger {
  private logs: PrivacyOperationLog[] = [];
  
  log(operation: Omit<PrivacyOperationLog, 'id' | 'timestamp'>): void {
    const logEntry: PrivacyOperationLog = {
      ...operation,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    
    // In production, log to secure centralized system
    console.log('[AUDIT]', logEntry);
  }
  
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  getLogs(userId?: string): PrivacyOperationLog[] {
    return userId 
      ? this.logs.filter(log => log.userId === userId)
      : this.logs;
  }
}

// Usage
const auditLogger = new PrivacyAuditLogger();

async function auditedEncrypt(userId: string, data: any, password: string) {
  try {
    const result = await privacy.encrypt(data, password);
    
    auditLogger.log({
      userId,
      operation: 'encrypt',
      dataSize: JSON.stringify(data).length,
      success: true,
      requestId: generateRequestId(),
      metadata: { method: 'AES-256' }
    });
    
    return result;
  } catch (error) {
    auditLogger.log({
      userId,
      operation: 'encrypt',
      dataSize: JSON.stringify(data).length,
      success: false,
      requestId: generateRequestId(),
      metadata: { error: error.message }
    });
    
    throw error;
  }
}
```

### Compliance Considerations

**GDPR, CCPA, and other privacy regulations:**

- Implement data deletion capabilities
- Provide data portability options
- Maintain consent records
- Implement privacy by design

```typescript
// Right to be forgotten implementation
class PrivacyDataController {
  private userData: Map<string, any> = new Map();
  
  async storeEncryptedData(userId: string, data: any, password: string): Promise<string> {
    const encryptedData = await privacy.encrypt(data, password);
    
    // Store with user reference
    if (!this.userData.has(userId)) {
      this.userData.set(userId, []);
    }
    
    const id = this.generateId();
    this.userData.get(userId)?.push({
      id,
      data: encryptedData,
      timestamp: new Date().toISOString(),
      purpose: 'user-profile'
    });
    
    return id;
  }
  
  async deleteUserData(userId: string): Promise<void> {
    this.userData.delete(userId);
    console.log(`Privacy data for user ${userId} deleted for right to be forgotten`);
  }
  
  private generateId(): string {
    return `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## Security Monitoring

### Intrusion Detection

**Monitor for unusual access patterns:**

```typescript
class SecurityMonitor {
  private suspiciousActivities: any[] = [];
  
  checkForAnomalies(userId: string, operation: string) {
    // Check for unusual patterns
    const recentOperations = this.getRecentOperations(userId, 5 * 60 * 1000); // 5 minutes
    
    if (recentOperations.length > 50) { // More than 50 operations in 5 minutes
      this.flagActivity({
        userId,
        operation,
        reason: 'High operation frequency',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  private getRecentOperations(userId: string, timeWindowMs: number): any[] {
    // Implementation would check recent activity logs
    return [];
  }
  
  private flagActivity(activity: any): void {
    this.suspiciousActivities.push(activity);
    console.error('Security alert:', activity);
    
    // In production, send alerts to security team
    this.sendSecurityAlert(activity);
  }
  
  private sendSecurityAlert(activity: any): void {
    // Send to security monitoring system
    console.log('SECURITY ALERT:', activity);
  }
}

// Usage
const securityMonitor = new SecurityMonitor();

async function monitoredOperation(userId: string, operation: () => Promise<any>) {
  securityMonitor.checkForAnomalies(userId, 'privacy-operation');
  return await operation();
}
```

## Testing Security

### Security-Centered Testing

```typescript
// Security test suite
describe('Privacy Security Tests', () => {
  test('API key is not exposed in error messages', async () => {
    const privacy = new ArciumPrivacy({
      apiKey: 'test-key-123',
      baseUrl: 'invalid-url'
    });
    
    try {
      await privacy.healthCheck();
    } catch (error) {
      // Ensure API key is not in error message
      expect(error.message).not.toContain('test-key-123');
    }
  });
  
  test('Sensitive data is not logged', () => {
    const sensitiveData = 'secret information';
    const logged = captureLog(() => {
      // This would be a secure logging function
      secureLog('info', 'Operation', { data: sensitiveData });
    });
    
    // Verify sensitive data was not logged
    expect(logged).not.toContain(sensitiveData);
  });
});
```

## Incident Response

### Security Incident Procedures

1. **Detect:** Implement monitoring for security anomalies
2. **Contain:** Isolate affected systems immediately
3. **Eradicate:** Remove the threat source
4. **Recover:** Restore systems from clean backups
5. **Lessons Learned:** Document and improve security measures

```typescript
class SecurityIncidentHandler {
  async handleIncident(incident: { type: string, severity: string, details: any }) {
    // Step 1: Log incident securely
    this.logIncident(incident);
    
    // Step 2: Alert security team
    await this.alertSecurityTeam(incident);
    
    // Step 3: Take protective actions based on severity
    switch (incident.severity) {
      case 'high':
        // Temporarily disable affected systems
        await this.disableAffectedSystems();
        break;
      case 'critical':
        // Full system lockdown
        await this.initiateLockdown();
        break;
    }
    
    // Step 4: Begin investigation
    await this.startInvestigation(incident);
  }
  
  private async alertSecurityTeam(incident: any): Promise<void> {
    console.error('SECURITY INCIDENT:', incident);
    // In production, send to security team via secure channel
  }
  
  private async disableAffectedSystems(): Promise<void> {
    console.log('Disabling affected privacy systems');
    // Implementation would disable specific components
  }
  
  private logIncident(incident: any): void {
    console.log('INCIDENT LOGGED:', {
      ...incident,
      timestamp: new Date().toISOString()
    });
  }
  
  private async startInvestigation(incident: any): Promise<void> {
    console.log('Starting security investigation for incident:', incident.type);
  }
  
  private async initiateLockdown(): Promise<void> {
    console.log('Initiating full security lockdown');
    // Implementation would perform comprehensive system lock
  }
}
```

---

Following these security best practices will help ensure your Arcium Privacy implementation maintains the highest level of security while preserving privacy. Regular security reviews and updates to these practices are recommended as the threat landscape evolves.