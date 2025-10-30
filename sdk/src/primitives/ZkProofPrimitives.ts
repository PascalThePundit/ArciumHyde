import { PrivacyPrimitive, PrivacyInput, PrivacyOutput } from '../types'; // Updated import path
import { ZkProofService } from '../services/zkproof';

export class RangeProofPrimitive implements PrivacyPrimitive {
  id = 'range-proof';
  name = 'Range Proof Primitive';
  description = 'Generates zero-knowledge proof that a value is within a range';
  category = 'zk-proof';
  version = '1.0.0';
  author = 'Arcium Team';
  tags = ['zk-proof', 'range', 'privacy'];
  dependencies = [];
  inputs = {};
  outputs = {};

  constructor(private zkProofService: ZkProofService) {}

  async execute(input: PrivacyInput): Promise<PrivacyOutput> {
    const { value, min, max } = input;
    
    if (value === undefined || min === undefined || max === undefined) {
      throw new Error('Value, min, and max are required for range proof');
    }

    const proof = await this.zkProofService.generateRangeProof(value, min, max);
    
    return {
      proof,
      value,
      range: [min, max],
      success: true
    };
  }
}

export class BalanceProofPrimitive implements PrivacyPrimitive {
  id = 'balance-proof';
  name = 'Balance Proof Primitive';
  description = 'Generates zero-knowledge proof of a balance being above threshold';
  category = 'zk-proof';
  version = '1.0.0';
  author = 'Arcium Team';
  tags = ['zk-proof', 'balance', 'financial-privacy'];
  dependencies = [];
  inputs = {};
  outputs = {};

  constructor(private zkProofService: ZkProofService) {}

  async execute(input: PrivacyInput): Promise<PrivacyOutput> {
    const { balance, threshold } = input;
    
    if (balance === undefined || threshold === undefined) {
      throw new Error('Balance and threshold are required for balance proof');
    }

    const proof = await this.zkProofService.generateBalanceProof(balance, threshold);
    
    return {
      proof,
      balance,
      threshold,
      isAboveThreshold: balance >= threshold,
      success: true
    };
  }
}
