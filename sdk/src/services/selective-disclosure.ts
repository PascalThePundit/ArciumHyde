import { ArciumPrivacyClient } from '../client';
import { Claim, DisclosureRequest, DisclosureResponse } from '../types'; // Ensure Claim has 'issuer'
import { ArciumPrivacyError } from '../errors';

// Define an interface for the data passed to issueClaim
interface IssueClaimData {
  type: string;
  subject: string;
  attributes: Record<string, any>;
  disclosurePolicy?: any;
  expirationDate?: number;
  issuer?: string; // Make issuer optional here
}

/**
 * Service for handling selective disclosure operations
 */
export class SelectiveDisclosureService {
  constructor(private client: ArciumPrivacyClient) {}

  /**
   * Issues a verifiable claim
   * @param claimData - The data for the claim
   * @returns The issued claim
   */
  async issueClaim(claimData: IssueClaimData): Promise<Claim> { // Use the new interface
    try {
      const response = await this.client.request('/selective-disclosure/issue-claim', {
        method: 'POST',
        body: JSON.stringify({
          type: claimData.type,
          issuer: claimData.issuer || 'arcium-sdk', // Default issuer
          subject: claimData.subject,
          attributes: claimData.attributes,
          disclosurePolicy: claimData.disclosurePolicy || {
            public: [],
            conditional: [],
            private: Object.keys(claimData.attributes)
          },
          expirationDate: claimData.expirationDate
        })
      });

      if (!response.success || !response.data) {
        throw new ArciumPrivacyError(
          response.error || 'Claim issuance failed',
          undefined,
          'CLAIM_ISSUANCE_FAILED'
        );
      }

      return response.data.claim;
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }

      throw new ArciumPrivacyError(
        (error as Error).message || 'Claim issuance failed', // Type assertion
        undefined,
        'CLAIM_ISSUANCE_FAILED'
      );
    }
  }

  /**
   * Creates a disclosure request
   * @param requestData - The disclosure request data
   * @returns The created disclosure request
   */
  async createDisclosureRequest(requestData: {
    verifier: string;
    requestedClaims: Array<{
      type: string;
      requiredAttributes: string[];
      conditions?: Record<string, any>;
    }>;
    justification: string;
    expiresInSeconds?: number;
  }): Promise<DisclosureRequest> {
    try {
      const response = await this.client.request('/selective-disclosure/create-request', {
        method: 'POST',
        body: JSON.stringify({
          verifier: requestData.verifier,
          requestedClaims: requestData.requestedClaims,
          justification: requestData.justification,
          expiresInSeconds: requestData.expiresInSeconds || 3600
        })
      });

      if (!response.success || !response.data) {
        throw new ArciumPrivacyError(
          response.error || 'Disclosure request creation failed',
          undefined,
          'DISCLOSURE_REQUEST_FAILED'
        );
      }

      return response.data.request;
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }

      throw new ArciumPrivacyError(
        (error as Error).message || 'Disclosure request creation failed', // Type assertion
        undefined,
        'DISCLOSURE_REQUEST_FAILED'
      );
    }
  }

  /**
   * Responds to a disclosure request
   * @param request - The disclosure request
   * @param claims - The claims to use for the response
   * @returns The disclosure response
   */
  async respondToRequest(
    request: DisclosureRequest,
    claims: Claim[]
  ): Promise<DisclosureResponse> {
    try {
      const response = await this.client.request('/selective-disclosure/respond', {
        method: 'POST',
        body: JSON.stringify({
          request,
          holder: request.verifier, // In a real implementation, this would be the holder
          claims
        })
      });

      if (!response.success || !response.data) {
        throw new ArciumPrivacyError(
          response.error || 'Disclosure response failed',
          undefined,
          'DISCLOSURE_RESPONSE_FAILED'
        );
      }

      return response.data.response;
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }

      throw new ArciumPrivacyError(
        (error as Error).message || 'Disclosure response failed', // Type assertion
        undefined,
        'DISCLOSURE_RESPONSE_FAILED'
      );
    }
  }

  /**
   * Verifies a disclosure response
   * @param response - The disclosure response to verify
   * @param request - The original disclosure request
   * @returns Whether the disclosure response is valid
   */
  async verifyResponse(
    response: DisclosureResponse,
    request: DisclosureRequest
  ): Promise<boolean> {
    try {
      const apiResponse = await this.client.request('/selective-disclosure/verify', {
        method: 'POST',
        body: JSON.stringify({
          response,
          request
        })
      });

      if (!apiResponse.success) {
        throw new ArciumPrivacyError(
          apiResponse.error || 'Disclosure verification failed',
          undefined,
          'DISCLOSURE_VERIFICATION_FAILED'
        );
      }

      return apiResponse.data.isValid as boolean;
    } catch (error: unknown) { // Explicitly type error as unknown
      if (error instanceof ArciumPrivacyError) {
        throw error;
      }

      throw new ArciumPrivacyError(
        (error as Error).message || 'Disclosure verification failed', // Type assertion
        undefined,
        'DISCLOSURE_VERIFICATION_FAILED'
      );
    }
  }

  /**
   * Issues an age verification claim
   * @param subject - The subject of the claim
   * @param age - The age to verify
   * @returns The issued age verification claim
   */
  async issueAgeClaim(subject: string, age: number): Promise<Claim> {
    return this.issueClaim({
      type: 'age_verification',
      subject,
      attributes: { age },
      disclosurePolicy: {
        public: [],
        conditional: [{
          attribute: 'age',
          condition: `age >= 18`,
          requiredBy: []
        }],
        private: ['age']
      }
    });
  }

  /**
   * Issues a credit score verification claim
   * @param subject - The subject of the claim
   * @param score - The credit score to verify
   * @returns The issued credit score verification claim
   */
  async issueCreditScoreClaim(subject: string, score: number): Promise<Claim> {
    return this.issueClaim({
      type: 'credit_score_verification',
      subject,
      attributes: { score },
      disclosurePolicy: {
        public: [],
        conditional: [{
          attribute: 'score',
          condition: `score >= 700`,
          requiredBy: []
        }],
        private: ['score']
      }
    });
  }

  /**
   * Issues a balance verification claim
   * @param subject - The subject of the claim
   * @param balance - The balance to verify
   * @returns The issued balance verification claim
   */
  async issueBalanceClaim(subject: string, balance: number): Promise<Claim> {
    return this.issueClaim({
      type: 'balance_verification',
      subject,
      attributes: { balance },
      disclosurePolicy: {
        public: [],
        conditional: [{
          attribute: 'balance',
          condition: `balance > 0`,
          requiredBy: []
        }],
        private: ['balance']
      }
    });
  }

  /**
   * Creates a disclosure request for age verification
   * @param subject - The subject to verify
   * @param minAge - Minimum age requirement (default: 18)
   * @returns The disclosure request
   */
  async createAgeVerificationRequest(
    subject: string,
    minAge: number = 18
  ): Promise<DisclosureRequest> {
    return this.createDisclosureRequest({
      verifier: 'arcium-sdk-verifier', // Default verifier
      requestedClaims: [{
        type: 'age_verification',
        requiredAttributes: ['age'],
        conditions: { age: `age >= ${minAge}` }
      }],
      justification: `Age verification: must be at least ${minAge} years old`
    });
  }

  /**
   * Creates a credit score verification request
   * @param subject - The subject to verify
   * @param minScore - Minimum credit score requirement (default: 700)
   * @returns The disclosure request
   */
  async createCreditScoreVerificationRequest(
    subject: string,
    minScore: number = 700
  ): Promise<DisclosureRequest> {
    return this.createDisclosureRequest({
      verifier: 'arcium-sdk-verifier',
      requestedClaims: [{
        type: 'credit_score_verification',
        requiredAttributes: ['score'],
        conditions: { score: `score >= ${minScore}` }
      }],
      justification: `Credit score verification: must be at least ${minScore}`
    });
  }

  /**
   * Creates a disclosure request for balance verification
   * @param subject - The subject to verify
   * @param minBalance - Minimum balance requirement (default: 1)
   * @returns The disclosure request
   */
  async createBalanceVerificationRequest(
    subject: string,
    minBalance: number = 1
  ): Promise<DisclosureRequest> {
    return this.createDisclosureRequest({
      verifier: 'arcium-sdk-verifier',
      requestedClaims: [{
        type: 'balance_verification',
        requiredAttributes: ['balance'],
        conditions: { balance: `balance >= ${minBalance}` }
      }],
      justification: `Balance verification: must have at least $${minBalance}`
    });
  }
}
