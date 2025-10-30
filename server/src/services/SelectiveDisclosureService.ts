import { v4 as uuidv4 } from 'uuid';
import { ZkProofService } from './ZkProofService';
import { logger } from '../utils/logger';
import { BadRequestError } from '../utils/errors';

export interface Claim {
  id: string;
  type: ClaimType;
  issuer: string;
  subject: string;
  issuanceDate: number;
  expirationDate?: number;
  attributes: Record<string, any>;
  proof: string; // JSON string of proof
  disclosurePolicy: any;
}

export interface SelectiveDisclosureRequest {
  id: string;
  verifier: string;
  requestedClaims: Array<{
    type: ClaimType;
    requiredAttributes: string[];
    conditions?: Record<string, any>;
  }>;
  justification: string;
  requestedAt: number;
  expiresAt: number;
}

export interface SelectiveDisclosureResponse {
  requestId: string;
  holder: string;
  disclosedClaims: Array<{
    claimId: string;
    type: ClaimType;
    disclosedAttributes: Record<string, any>;
    proof: string;
    timestamp: number;
  }>;
  signature: string;
  status: 'verified' | 'pending' | 'rejected';
}

export interface Attestation {
  id: string;
  issuer: string;
  subject: string;
  attribute: string;
  value: any;
  validity: {
    from: number;
    until: number;
  };
  proof: any;
  signature: string;
  metadata: any;
}

export interface CredentialSchema {
  id: string;
  name: string;
  description: string;
  version: string;
  attributes: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object';
    required: boolean;
    description: string;
    constraints?: Record<string, any>;
  }>;
  disclosurePolicy: any;
}

export type ClaimType = 
  | 'age_range' 
  | 'credit_score' 
  | 'account_balance' 
  | 'identity' 
  | 'custom';

export interface ThresholdPolicy {
  condition: string;
  requiredVerifiers: string[];
  validityPeriod?: number;
}

export class SelectiveDisclosureService {
  /**
   * Issue a new verifiable claim
   */
  static async issueClaim(
    type: ClaimType,
    issuer: string,
    subject: string,
    attributes: Record<string, any>,
    disclosurePolicy: any = null,
    expirationDate?: number
  ): Promise<Claim> {
    try {
      // Generate a ZK proof for the claim
      const proof = await this.generateClaimProof(type, attributes);

      const claim: Claim = {
        id: `claim_${uuidv4()}`,
        type,
        issuer,
        subject,
        issuanceDate: Date.now(),
        expirationDate,
        attributes,
        proof: JSON.stringify(proof),
        disclosurePolicy: disclosurePolicy || {
          public: [],
          conditional: [],
          private: Object.keys(attributes)
        }
      };

      // In a real implementation, we would save the claim to a database
      // For this demo, we'll just log it
      logger.info('Claim issued', {
        claimId: claim.id,
        issuer,
        subject,
        type
      });

      return claim;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Claim issuance failed', { 
        error: err.message, 
        issuer,
        subject,
        type
      });
      throw error;
    }
  }

  /**
   * Generate a ZK proof for a claim
   */
  private static async generateClaimProof(type: ClaimType, attributes: Record<string, any>) {
    // In a real implementation, this would create a proper ZK proof
    // For this demo, we'll create a mock proof based on the claim type

    switch (type) {
      case 'age_range':
        const age = attributes.age;
        return await ZkProofService.generateRangeProof(age, 0, 120);

      case 'credit_score':
        const score = attributes.score;
        // Generate a proof that score > 700 if it is
        if (score > 700) {
          return await ZkProofService.generateBalanceGreaterThanProof(score, 700);
        }
        break;

      case 'account_balance':
        const balance = attributes.balance;
        const threshold = attributes.threshold || 0;
        if (balance > threshold) {
          return await ZkProofService.generateBalanceGreaterThanProof(balance, threshold);
        }
        break;

      default:
        // For other types, create a simple mock proof
        return {
          proof: { pi_a: ['mock', 'proof'], pi_b: [['mock'], ['proof']], pi_c: ['mock'] },
          publicSignals: Object.values(attributes)
        };
    }
  }

  /**
   * Create a selective disclosure request
   */
  static createDisclosureRequest(
    verifier: string,
    requestedClaims: Array<{
      type: ClaimType;
      requiredAttributes: string[];
      conditions?: Record<string, any>;
    }>,
    justification: string,
    expiresInSeconds: number = 3600 // 1 hour default
  ): SelectiveDisclosureRequest {
    const request: SelectiveDisclosureRequest = {
      id: `req_${uuidv4()}`,
      verifier,
      requestedClaims,
      justification,
      requestedAt: Date.now(),
      expiresAt: Date.now() + (expiresInSeconds * 1000)
    };

    logger.info('Disclosure request created', {
      requestId: request.id,
      verifier,
      claimCount: requestedClaims.length
    });

    return request;
  }

  /**
   * Respond to a selective disclosure request
   */
  static async respondToRequest(
    request: SelectiveDisclosureRequest,
    holder: string,
    claims: Claim[]
  ): Promise<SelectiveDisclosureResponse> {
    const disclosedClaims = [];

    for (const reqClaim of request.requestedClaims) {
      // Find matching claims from the holder
      const matchingClaims = claims.filter(c =>
        c.type === reqClaim.type &&
        c.subject === holder
      );

      if (matchingClaims.length > 0) {
        // For each matching claim, determine what can be disclosed based on policy
        for (const claim of matchingClaims) {
          // Verify the claim is still valid
          if (this.isClaimValid(claim)) {
            const disclosedAttributes: Record<string, any> = {};

            // Add public attributes
            for (const attrName of claim.disclosurePolicy.public) {
              if (reqClaim.requiredAttributes.includes(attrName)) {
                disclosedAttributes[attrName] = claim.attributes[attrName];
              }
            }

            // Check conditional attributes
            for (const condAttr of claim.disclosurePolicy.conditional) {
              if (
                reqClaim.requiredAttributes.includes(condAttr.attribute) &&
                condAttr.requiredBy.includes(request.verifier)
              ) {
                // For conditional attributes, we might need to generate a new ZK proof
                // showing that the condition is satisfied without revealing the value
                const conditionProof = await this.generateConditionalProof(
                  condAttr.attribute,
                  claim.attributes[condAttr.attribute],
                  condAttr.condition
                );

                // For now, we'll just include the attribute if the condition is met
                if (await this.evaluateCondition(
                  claim.attributes[condAttr.attribute],
                  condAttr.condition
                )) {
                  disclosedAttributes[condAttr.attribute] = claim.attributes[condAttr.attribute];
                }
              }
            }

            // Add to response if we have relevant disclosed attributes
            if (Object.keys(disclosedAttributes).length > 0) {
              disclosedClaims.push({
                claimId: claim.id,
                type: claim.type,
                disclosedAttributes,
                proof: claim.proof, // Original proof
                timestamp: Date.now()
              });
            }
          }
        }
      }
    }

    const response: SelectiveDisclosureResponse = {
      requestId: request.id,
      holder,
      disclosedClaims,
      signature: `sig_${uuidv4()}`, // Mock signature
      status: 'verified'
    };

    logger.info('Disclosure response created', {
      requestId: request.id,
      holder,
      claimCount: disclosedClaims.length
    });

    return response;
  }

  /**
   * Generate a proof for a conditional attribute
   */
  private static async generateConditionalProof(
    attributeName: string,
    attributeValue: any,
    condition: string
  ) {
    // In a real implementation, this would generate a ZK proof showing
    // that the condition is satisfied without revealing the value
    // For this demo, we'll return a mock proof
    return {
      proof: { pi_a: ['conditional', 'proof'], pi_b: [['mock'], ['proof']], pi_c: ['conditional'] },
      publicSignals: [attributeName, condition]
    };
  }

  /**
   * Evaluate a condition against an attribute value
   */
  private static async evaluateCondition(attributeValue: any, condition: string): Promise<boolean> {
    // Parse and evaluate the condition (simplified for demo)
    // In a real implementation, this would be more sophisticated
    if (condition.includes('>')) {
      const parts = condition.split('>');
      const threshold = parseFloat(parts[1].trim());
      return attributeValue > threshold;
    }

    if (condition.includes('<')) {
      const parts = condition.split('<');
      const threshold = parseFloat(parts[1].trim());
      return attributeValue < threshold;
    }

    if (condition.includes('>=')) {
      const parts = condition.split('>=');
      const threshold = parseFloat(parts[1].trim());
      return attributeValue >= threshold;
    }

    if (condition.includes('<=')) {
      const parts = condition.split('<=');
      const threshold = parseFloat(parts[1].trim());
      return attributeValue <= threshold;
    }

    // For equality, membership in a set, etc.
    if (condition.includes('in')) {
      const setStr = condition.split('in')[1].trim();
      const set = JSON.parse(setStr); // Should be a valid JSON array
      return set.includes(attributeValue);
    }

    // Default to true if we can't parse the condition
    return true;
  }

  /**
   * Verify a selective disclosure response
   */
  static async verifyDisclosureResponse(
    response: SelectiveDisclosureResponse,
    request: SelectiveDisclosureRequest
  ): Promise<boolean> {
    try {
      // Check that the response is for the correct request
      if (response.requestId !== request.id) {
        return false;
      }

      // Check that the response hasn't expired
      const now = Date.now();
      if (now > request.expiresAt) {
        return false;
      }

      // Verify each disclosed claim
      for (const disclosedClaim of response.disclosedClaims) {
        // Find the original claim to verify against
        // In a real implementation, we'd fetch from a database
        // For this demo we'll assume it exists
        
        // Verify the proof is valid
        if (disclosedClaim.proof) {
          let proof;
          try {
            proof = JSON.parse(disclosedClaim.proof);
          } catch (e) {
            return false; // Invalid proof JSON
          }
          
          const isValid = await ZkProofService.verifyProof(
            proof.proof,
            proof.publicSignals || [],
            'balance_proof' // Using generic proof type for demo
          );

          if (!isValid) {
            return false;
          }
        }

        // Check that only allowed attributes were disclosed
        // This would be implemented based on the original claim's disclosure policy
        // For this demo, we'll assume all disclosed attributes are valid
      }

      return true;
    } catch (error: unknown) {
      const err = error as Error;
      logger.error('Disclosure verification failed', { error: err.message });
      return false;
    }
  }

  /**
   * Create an attestation
   */
  static async createAttestation(
    issuer: string,
    subject: string,
    attribute: string,
    value: any,
    schemaId: string,
    validityPeriodSeconds: number = 365 * 24 * 60 * 60 // 1 year default
  ): Promise<Attestation> {
    // In a real implementation, this would create a proper attestation with ZK proofs
    // For demo purposes, we'll create a mock attestation

    const attestation: Attestation = {
      id: `attestation_${uuidv4()}`,
      issuer,
      subject,
      attribute,
      value,
      validity: {
        from: Date.now(),
        until: Date.now() + (validityPeriodSeconds * 1000)
      },
      proof: {
        proof: { pi_a: ['attestation', 'proof'], pi_b: [['mock'], ['proof']], pi_c: ['proof'] },
        publicSignals: [attribute, value.toString()]
      },
      signature: `sig_${uuidv4()}`, // Mock signature
      metadata: {
        schema: schemaId,
        version: '1.0',
        tags: [`attestation-${attribute}`]
      }
    };

    logger.info('Attestation created', {
      attestationId: attestation.id,
      issuer,
      subject,
      attribute
    });

    return attestation;
  }

  /**
   * Create a credential schema
   */
  static createCredentialSchema(
    name: string,
    description: string,
    attributes: Array<{
      name: string;
      type: 'string' | 'number' | 'boolean' | 'date' | 'object';
      required: boolean;
      description: string;
      constraints?: Record<string, any>;
    }>,
    disclosurePolicy: any
  ): CredentialSchema {
    const schema: CredentialSchema = {
      id: `schema_${uuidv4()}`,
      name,
      description,
      version: '1.0',
      attributes,
      disclosurePolicy
    };

    logger.info('Credential schema created', {
      schemaId: schema.id,
      name
    });

    return schema;
  }

  /**
   * Check if a claim is valid (not expired)
   */
  static isClaimValid(claim: Claim): boolean {
    if (claim.expirationDate && claim.expirationDate < Date.now()) {
      return false;
    }
    return true;
  }

  /**
   * Apply threshold policy to determine if disclosure should happen
   */
  static async applyThresholdPolicy(
    policy: ThresholdPolicy,
    attributeValue: any,
    verifier: string
  ): Promise<boolean> {
    // Evaluate the condition
    const isValid = await this.evaluateCondition(attributeValue, policy.condition);

    // Check if verifier is in required list
    const isAuthorizedVerifier = policy.requiredVerifiers.includes(verifier);

    // Check validity period
    const now = Date.now();
    const policyValidUntil = policy.validityPeriod ? policy.validityPeriod * 1000 : Infinity;
    const isWithinValidity = now < policyValidUntil;

    return isValid && isAuthorizedVerifier && isWithinValidity;
  }
}