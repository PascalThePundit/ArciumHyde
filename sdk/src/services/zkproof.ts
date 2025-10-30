import { ArciumPrivacyClient } from '../client';
import { ZkProof } from '../types';
import { ArciumPrivacyError } from '../errors';

/**
 * Service for handling zero-knowledge proof operations
 */
export class ZkProofService {
  constructor(private client: ArciumPrivacyClient) {}

  /**
   * Generates a zero-knowledge proof
   * @param circuitName - Name of the circuit to use
   * @param inputs - Inputs for the proof generation
   * @returns The generated proof
   */
  async generateProof(circuitName: string, inputs: Record<string, any>): Promise<ZkProof> {
    try {
      const response = await this.client.request('/zk-proof/generate', {
        method: 'POST',
        body: JSON.stringify({
          circuitName,
          inputs
        })
      });

      if (!response.success || !response.data) {
        throw new ArciumPrivacyError(
          response.error || 'Proof generation failed',
          undefined,
          'PROOF_GENERATION_FAILED'
        );
      }

      return {
        proof: response.data.proof,
        publicInputs: response.data.publicSignals, // Assuming publicSignals from API maps to publicInputs in ZkProof
        circuitName: response.data.circuitName,
        inputs: response.data.inputs
      };
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }

      throw new ArciumPrivacyError(
        (error as Error).message || ArciumPrivacyError.createHelpfulMessage('PROOF_GENERATION_FAILED'), // Type assertion
        undefined,
        'PROOF_GENERATION_FAILED'
      );
    }
  }

  /**
   * Verifies a zero-knowledge proof
   * @param proof - The proof to verify
   * @returns Whether the proof is valid
   */
  async verifyProof(proof: any): Promise<boolean> {
    try {
      // Extract proof data and public signals
      const proofData = typeof proof === 'string' ? JSON.parse(proof) : proof;
      
      const response = await this.client.request('/zk-proof/verify', {
        method: 'POST',
        body: JSON.stringify({
          proof: proofData.proof || proofData,
          publicInputs: proofData.publicInputs || [], // Changed from publicSignals to publicInputs
          circuitName: proofData.circuitName || 'unknown'
        })
      });

      if (!response.success) {
        throw new ArciumPrivacyError(
          response.error || 'Proof verification failed',
          undefined,
          'PROOF_VERIFICATION_FAILED'
        );
      }

      return response.data.isValid as boolean;
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }

      throw new ArciumPrivacyError(
        (error as Error).message || ArciumPrivacyError.createHelpfulMessage('PROOF_VERIFICATION_FAILED'), // Type assertion
        undefined,
        'PROOF_VERIFICATION_FAILED'
      );
    }
  }

  /**
   * Generates a range proof (value is within [min, max])
   * @param value - The value to prove
   * @param min - Minimum value in the range
   * @param max - Maximum value in the range
   * @returns The generated range proof
   */
  async generateRangeProof(value: number, min: number, max: number): Promise<ZkProof> {
    if (value < min || value > max) {
      throw new ArciumPrivacyError(
        `Value ${value} is not within range [${min}, ${max}]`,
        undefined,
        'INVALID_PROOF_INPUTS'
      );
    }

    try {
      const response = await this.client.request('/zk-proof/generate-range-proof', {
        method: 'POST',
        body: JSON.stringify({
          value,
          min,
          max
        })
      });

      if (!response.success || !response.data) {
        throw new ArciumPrivacyError(
          response.error || 'Range proof generation failed',
          undefined,
          'RANGE_PROOF_GENERATION_FAILED'
        );
      }

      return {
        proof: response.data.proof,
        publicInputs: response.data.publicSignals, // Assuming publicSignals from API maps to publicInputs in ZkProof
        circuitName: 'range_proof',
        inputs: { value, min, max } // Changed to object
      };
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }

      throw new ArciumPrivacyError(
        (error as Error).message || ArciumPrivacyError.createHelpfulMessage('INVALID_PROOF_INPUTS'), // Type assertion
        undefined,
        'INVALID_PROOF_INPUTS'
      );
    }
  }

  /**
   * Generates a balance proof (balance is greater than threshold)
   * @param balance - The balance to prove
   * @param threshold - The threshold to compare against
   * @returns The generated balance proof
   */
  async generateBalanceProof(balance: number, threshold: number): Promise<ZkProof> {
    if (balance <= threshold) {
      throw new ArciumPrivacyError(
        `Balance ${balance} is not greater than threshold ${threshold}`,
        undefined,
        'INVALID_PROOF_INPUTS'
      );
    }

    try {
      const response = await this.client.request('/zk-proof/generate-balance-proof', {
        method: 'POST',
        body: JSON.stringify({
          balance,
          threshold
        })
      });

      if (!response.success || !response.data) {
        throw new ArciumPrivacyError(
          response.error || 'Balance proof generation failed',
          undefined,
          'BALANCE_PROOF_GENERATION_FAILED'
        );
      }

      return {
        proof: response.data.proof,
        publicInputs: response.data.publicSignals, // Assuming publicSignals from API maps to publicInputs in ZkProof
        circuitName: 'balance_proof',
        inputs: { balance, threshold } // Changed to object
      };
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }

      throw new ArciumPrivacyError(
        (error as Error).message || ArciumPrivacyError.createHelpfulMessage('INVALID_PROOF_INPUTS'), // Type assertion
        undefined,
        'INVALID_PROOF_INPUTS'
      );
    }
  }

  /**
   * Generates an age proof (age is within a range) - simplified for common use
   * @param age - The age to prove
   * @param minAge - Minimum age (default: 18)
   * @param maxAge - Maximum age (default: 100)
   * @returns The generated age proof
   */
  async generateAgeProof(age: number, minAge: number = 18, maxAge: number = 100): Promise<ZkProof> {
    return this.generateRangeProof(age, minAge, maxAge);
  }

  /**
   * Generates a credit score proof (score is above threshold)
   * @param score - The credit score to prove
   * @param minScore - Minimum score threshold (default: 300)
   * @returns The generated credit score proof
   */
  async generateCreditScoreProof(score: number, minScore: number = 300): Promise<ZkProof> {
    return this.generateBalanceProof(score, minScore);
  }

  /**
   * Generates a proof that a value satisfies a comparison
   * @param value - The value to prove
   * @param operator - The comparison operator ('gt', 'gte', 'lt', 'lte')
   * @param threshold - The threshold to compare against
   * @returns The generated comparison proof
   */
  async generateComparisonProof(
    value: number,
    operator: 'gt' | 'gte' | 'lt' | 'lte',
    threshold: number
  ): Promise<ZkProof> {
    switch (operator) {
      case 'gt':
        return this.generateBalanceProof(value, threshold);
      case 'gte':
        // For greater than or equal, we can use a range proof from threshold to max possible value
        return this.generateRangeProof(value, threshold, Number.MAX_SAFE_INTEGER);
      case 'lt':
        // For less than, we can use a range proof from 0 to (threshold - 1)
        return this.generateRangeProof(value, 0, threshold - 1);
      case 'lte':
        // For less than or equal, we can use a range proof from 0 to threshold
        return this.generateRangeProof(value, 0, threshold);
      default:
        throw new ArciumPrivacyError(`Unsupported operator: ${operator}`, undefined, 'INVALID_OPERATOR');
    }
  }
}
