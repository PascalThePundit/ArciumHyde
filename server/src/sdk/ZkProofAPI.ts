import { 
  ArciumSDKConfig, 
  ZkProofRequest,
  RangeProofRequest,
  BalanceProofRequest,
  APIResponse,
  ZkProofResponse
} from './types';

export class ZkProofAPI {
  private config: ArciumSDKConfig;

  constructor(config: ArciumSDKConfig) {
    this.config = config;
  }

  /**
   * Updates the configuration for this API instance
   */
  updateConfig(newConfig: ArciumSDKConfig): void {
    this.config = newConfig;
  }

  /**
   * Generate a ZK proof for the given circuit and inputs
   */
  async generateProof(circuitName: string, inputs: Record<string, any>): Promise<APIResponse<ZkProofResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/zk-proof/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        circuitName,
        inputs
      })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Verify a ZK proof
   */
  async verifyProof(proof: any, publicSignals: string[], circuitName: string): Promise<APIResponse<boolean>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/zk-proof/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        proof,
        publicSignals,
        circuitName
      })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Generate a range proof (value is within [min, max])
   */
  async generateRangeProof(value: number, min: number, max: number): Promise<APIResponse<ZkProofResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/zk-proof/generate-range-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        value,
        min,
        max
      })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Generate a balance greater than proof
   */
  async generateBalanceGreaterThanProof(balance: number, threshold: number): Promise<APIResponse<ZkProofResponse>> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/zk-proof/generate-balance-proof`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify({
        balance,
        threshold
      })
    });

    const result = await response.json();
    return result;
  }

  /**
   * Generate an age proof (age is within a range)
   */
  async generateAgeProof(age: number, minAge: number = 18, maxAge: number = 120): Promise<APIResponse<ZkProofResponse>> {
    return this.generateRangeProof(age, minAge, maxAge);
  }

  /**
   * Generate a credit score proof (credit score is above threshold)
   */
  async generateCreditScoreProof(score: number, minScore: number = 300): Promise<APIResponse<ZkProofResponse>> {
    return this.generateBalanceGreaterThanProof(score, minScore);
  }

  /**
   * Generate a proof that a value satisfies a condition
   */
  async generateConditionalProof(
    value: number, 
    operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq', 
    threshold: number
  ): Promise<APIResponse<ZkProofResponse>> {
    switch (operator) {
      case 'gt':
        return this.generateBalanceGreaterThanProof(value, threshold);
      case 'gte':
        // For greater than or equal, we'd use a range proof from threshold to max possible value
        return this.generateRangeProof(value, threshold, Number.MAX_SAFE_INTEGER);
      case 'lt':
        // Less than is more complex in ZK - would need a range proof
        return this.generateRangeProof(value, 0, threshold - 1);
      case 'lte':
        return this.generateRangeProof(value, 0, threshold);
      case 'eq':
        // Equality proofs require different circuits
        throw new Error('Equality proofs not yet implemented');
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}