import { ArciumPrivacy } from '../src/index';
import { ArciumPrivacyError } from '../src/errors';

// Mock the API responses for testing
jest.mock('../src/client', () => {
  // Create a mock constructor that implements the same interface as the real one
  const mockConstructor = jest.fn().mockImplementation((config) => {
    // Validate that API key is provided
    if (!config.apiKey) {
      throw new ArciumPrivacyError('API key is required', undefined, 'CONFIG_ERROR');
    }
    
    // Create a more sophisticated mock request function that returns different responses based on the endpoint
    const mockRequest = jest.fn().mockImplementation((endpoint, options) => {
      // Return different responses based on the endpoint
      if (endpoint === '/encrypt') {
        return Promise.resolve({
          success: true,
          data: {
            encryptedData: 'mock-encrypted-data',
            metadata: {
              method: 'aes256'
            }
          },
          timestamp: new Date().toISOString()
        });
      } else if (endpoint === '/decrypt') {
        return Promise.resolve({
          success: true,
          data: {
            decryptedData: 'test data' // Return the original data for decrypt
          },
          timestamp: new Date().toISOString()
        });
      } else if (endpoint === '/zk-proof/generate') {
        // Handle ZK proof generation
        return Promise.resolve({
          success: true,
          data: {
            proof: { pi_a: ['mock'], pi_b: [['mock']], pi_c: ['mock'] },
            publicSignals: ['mock'], // Use publicSignals as per ZkProofService
            circuitName: 'mock-circuit',
            inputs: ['mock']
          },
          timestamp: new Date().toISOString()
        });
      } else if (endpoint === '/zk-proof/generate-range-proof') {
        // Handle range proof generation
        return Promise.resolve({
          success: true,
          data: {
            proof: { pi_a: ['mock'], pi_b: [['mock']], pi_c: ['mock'] },
            publicSignals: ['mock'],
            circuitName: 'range_proof',
            inputs: { value: 25, min: 18, max: 100 }
          },
          timestamp: new Date().toISOString()
        });
      } else if (endpoint === '/zk-proof/generate-balance-proof') {
        // Handle balance proof generation
        return Promise.resolve({
          success: true,
          data: {
            proof: { pi_a: ['mock'], pi_b: [['mock']], pi_c: ['mock'] },
            publicSignals: ['mock'],
            circuitName: 'balance_proof',
            inputs: { balance: 1500, threshold: 1000 }
          },
          timestamp: new Date().toISOString()
        });
      } else if (endpoint === '/zk-proof/verify') {
        // Handle ZK proof verification
        return Promise.resolve({
          success: true,
          data: {
            isValid: true // Return isValid property
          },
          timestamp: new Date().toISOString()
        });
      } else if (endpoint === '/selective-disclosure/issue-claim') {
        // Handle claim issuance
        return Promise.resolve({
          success: true,
          data: {
            claim: {
              id: 'mock-claim-id',
              issuer: 'mock-issuer',
              subject: 'test-user',
              attributes: { age: 25 },
              type: 'age_verification'
            }
          },
          timestamp: new Date().toISOString()
        });
      } else if (endpoint === '/selective-disclosure/create-request') {
        // Handle disclosure request creation
        return Promise.resolve({
          success: true,
          data: {
            request: {
              id: 'mock-request-id',
              verifier: 'test-verifier'
            }
          },
          timestamp: new Date().toISOString()
        });
      } else {
        // Default response for other endpoints
        return Promise.resolve({
          success: true,
          data: {
            encryptedData: 'mock-encrypted-data',
            metadata: {
              method: 'aes256'
            },
            proof: { pi_a: ['mock'], pi_b: [['mock']], pi_c: ['mock'] },
            publicSignals: ['mock'],
            circuitName: 'mock-circuit',
            inputs: ['mock']
          },
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return {
      request: mockRequest,
      getBalance: jest.fn().mockResolvedValue(100), // Return the value directly as per the ArciumPrivacy.getBalance method
      getUsage: jest.fn().mockResolvedValue({
        success: true,
        data: { totalOperations: 5, totalCost: 10 },
        timestamp: new Date().toISOString()
      }),
      healthCheck: jest.fn().mockResolvedValue({
        success: true,
        data: { status: 'healthy' },
        timestamp: new Date().toISOString()
      })
    };
  });

  return {
    ArciumPrivacyClient: mockConstructor
  };
});

describe('ArciumPrivacy SDK', () => {
  let privacy: ArciumPrivacy;

  beforeEach(() => {
    privacy = new ArciumPrivacy({
      apiKey: 'test-api-key',
      baseUrl: 'https://test.arcium-privacy.com'
    });
  });

  describe('Initialization', () => {
    it('should initialize with valid config', () => {
      expect(privacy).toBeInstanceOf(ArciumPrivacy);
    });

    it('should throw error if API key is missing', () => {
      expect(() => {
        new ArciumPrivacy({} as any);
      }).toThrow(ArciumPrivacyError);
    });
  });

  describe('Encryption', () => {
    it('should encrypt data successfully', async () => {
      const result = await privacy.encrypt('test data', 'password');
      expect(result).toHaveProperty('encryptedData');
      expect(result.metadata && result.metadata['method']).toBe('aes256');
    });

    it('should decrypt data successfully', async () => {
      const encrypted = await privacy.encrypt('test data', 'password');
      const result = await privacy.decrypt(encrypted.encryptedData, 'password');
      expect(result).toBe('test data');
    });
  });

  describe('Zero-Knowledge Proofs', () => {
    it('should generate range proof', async () => {
      const result = await privacy.prove('range', { value: 25, min: 18, max: 100 });
      expect(result).toHaveProperty('proof');
      expect(result).toHaveProperty('publicInputs');
    });

    it('should generate balance proof', async () => {
      const result = await privacy.prove('balance', { balance: 1500, threshold: 1000 });
      expect(result).toHaveProperty('proof');
      expect(result).toHaveProperty('publicInputs');
    });

    it('should verify proof', async () => {
      const proof = await privacy.prove('range', { value: 25, min: 18, max: 100 });
      const result = await privacy.verify(proof);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Verifiable Claims', () => {
    it('should issue a claim', async () => {
      const result = await privacy.issueClaim({
        type: 'age_verification',
        subject: 'test-user',
        attributes: { age: 25 }
      });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('type');
    });

    it('should create disclosure request', async () => {
      const result = await privacy.createDisclosureRequest({
        verifier: 'test-verifier',
        requestedClaims: [{
          type: 'age_verification',
          requiredAttributes: ['age']
        }],
        justification: 'Testing'
      });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('verifier');
    });
  });

  describe('Account Functions', () => {
    it('should get account balance', async () => {
      const result = await privacy.getBalance();
      expect(result).toBe(100);
    });

    it('should get usage statistics', async () => {
      const result = await privacy.getUsage();
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('totalOperations');
    });

    it('should perform health check', async () => {
      const result = await privacy.healthCheck();
      expect(result.success).toBe(true);
    });
  });
});