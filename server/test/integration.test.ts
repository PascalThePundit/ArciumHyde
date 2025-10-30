// server/test/integration.test.ts
import { ComprehensivePrivacyService } from '../src/services/ComprehensivePrivacyService';

describe('Comprehensive Privacy Integration', () => {
  let privacyService: ComprehensivePrivacyService;

  beforeAll(() => {
    privacyService = new ComprehensivePrivacyService({
      solana: {
        clusterUrl: process.env.SOLANA_CLUSTER_URL || 'https://api.devnet.solana.com',
        programId: process.env.SOLANA_PROGRAM_ID || ''
      },
      mpc: {
        threshold: 2,
        totalParties: 3
      },
      fhe: {
        securityLevel: 128
      },
      tee: {
        enclaveId: process.env.TEE_ENCLAVE_ID || 'test-enclave',
        verificationKey: process.env.TEE_VERIFICATION_KEY || 'test-key'
      }
    });
  });

  test('should initialize all privacy services successfully', async () => {
    const result = await privacyService.initialize();
    expect(result).toBe(true);
  });

  test('should execute basic encryption operation', async () => {
    const result = await privacyService.executePrivacyOperation({
      data: 'test data',
      operation: 'encrypt',
      options: { password: 'test-password' }
    });

    expect(result.success).toBe(true);
    expect(result.operationType).toBe('encrypt');
    expect(result.privacyLevel).toBe('basic');
  });

  test('should execute zero-knowledge proof operation', async () => {
    const result = await privacyService.executePrivacyOperation({
      data: null,
      operation: 'zk-proof',
      options: { type: 'range', value: 25, min: 18, max: 100 }
    });

    expect(result.success).toBe(true);
    expect(result.operationType).toBe('zk-proof');
    expect(result.privacyLevel).toBe('enhanced');
  });

  test('should execute MPC operation', async () => {
    const result = await privacyService.executePrivacyOperation({
      data: 42,
      operation: 'multi-party-compute',
      options: { operation: 'add', parties: [1, 2, 3] }
    });

    expect(result.success).toBe(true);
    expect(result.operationType).toBe('multi-party-compute');
    expect(result.privacyLevel).toBe('maximum');
  });

  test('should execute FHE operation', async () => {
    const result = await privacyService.executePrivacyOperation({
      data: 10,
      operation: 'homomorphic',
      options: { operation: 'add', addend: 5 }
    });

    expect(result.success).toBe(true);
    expect(result.operationType).toBe('homomorphic');
    expect(result.privacyLevel).toBe('maximum');
  });

  test('should execute TEE operation', async () => {
    const result = await privacyService.executePrivacyOperation({
      data: { test: 'data' },
      operation: 'tee-secure',
      options: { operation: 'compute' }
    });

    expect(result.success).toBe(true);
    expect(result.operationType).toBe('tee-secure');
    expect(result.privacyLevel).toBe('maximum');
  });

  test('should execute composite privacy operations', async () => {
    const result = await privacyService.executeCompositeOperation(
      'sensitive data',
      ['encrypt', 'zk-proof']
    );

    expect(result.success).toBe(true);
    expect(result.privacyLevel).toBe('enhanced'); // Upgraded from basic to enhanced
  });
});